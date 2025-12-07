"""
Background Worker Service
"""
import time
import threading
import requests

from ml.ocr import run_ocr, run_ocr_enhanced
from ml.kolosal_ocr import run_ocr_kolosal, format_kolosal_result_for_file
from core.queue_manager import (
    get_job, update_job,
    get_next_job_for_worker, clear_current_job
)
from utils.ai_formatter import parse_json_from_response
from services.chat_service import format_text_via_chat, save_ocr_result_to_chat
from services.file_converter_service import convert_to_excel, convert_to_pdf


def process_job(job_id):
    """Process a single OCR job"""
    job = get_job(job_id)
    if job is None:
        return
    
    started_at = time.time()
    update_job(job_id, status="processing", started_at=started_at)
    
    ocr_results = []
    
    try:
        use_enhanced = job.get("use_enhanced", False)
        ocr_options = job.get("ocr_options", {})
        images = job["images"]
        job_type = job["type"]
        file_type = job.get("file_type", "excel")
        user_id = job.get("user_id")
        engine = job.get("engine", "paddleocr")  # Get engine from job
        
        # Step 1: OCR Processing
        if engine == "kolosalocr":
            kolosal_titles = []
            
            if job_type == "single":
                image = images[0]
                kolosal_result = run_ocr_kolosal(image, ocr_options)
                formatted = format_kolosal_result_for_file(kolosal_result)
                ocr_results.append(formatted)
                kolosal_titles.append(kolosal_result.get("title"))
            elif job_type == "batch":
                processed = 0
                for img in images:
                    kolosal_result = run_ocr_kolosal(img, ocr_options)
                    formatted = format_kolosal_result_for_file(kolosal_result)
                    ocr_results.append(formatted)
                    kolosal_titles.append(kolosal_result.get("title"))
                    processed += 1
                    update_job(job_id, processed=processed)
            
            normalized_results = ocr_results
            chat_id = None
            
            if user_id:
                combined_result = "\n\n--- Page Break ---\n\n".join(
                    [str(r) if isinstance(r, dict) else r for r in ocr_results]
                )
                ocr_title = next((t for t in kolosal_titles if t), None)
                chat_result = save_ocr_result_to_chat(user_id, combined_result, title=ocr_title, engine=engine)
                if "error" not in chat_result:
                    chat_id = chat_result.get("chat_id")
                else:
                    print(f"Failed to save OCR to chat: {chat_result.get('error')}")
            
        else:
            # PaddleOCR processing
            if job_type == "single":
                image = images[0]
                if use_enhanced:
                    result = run_ocr_enhanced(image, ocr_options)
                else:
                    result = run_ocr(image)
                ocr_results.append(result)
                
            elif job_type == "batch":
                processed = 0
                for img in images:
                    if use_enhanced:
                        out = run_ocr_enhanced(img, ocr_options)
                    else:
                        out = run_ocr(img)
                    ocr_results.append(out)
                    processed += 1
                    update_job(job_id, processed=processed)
            
            # Step 2: Format with AI via Chat Service (only for PaddleOCR)
            update_job(job_id, status="formatting")
            normalized_results = []
            chat_id = None
            
            # Combine all OCR results into one text for formatting
            combined_text = "\n\n--- Page Break ---\n\n".join(ocr_results)
            
            if user_id:
                chat_result = format_text_via_chat(user_id, combined_text)
                
                if "error" not in chat_result:
                    chat_id = chat_result.get("chat_id")
                    ai_response = chat_result.get("response", "")
                    
                    # Parse JSON from response
                    parsed = parse_json_from_response(ai_response)
                    normalized_results.append(parsed)
                else:
                    print(f"Chat formatting failed: {chat_result.get('error')}")
                    for text in ocr_results:
                        normalized_results.append({"data": text, "is_json": False})
            else:
                for text in ocr_results:
                    normalized_results.append({"data": text, "is_json": False})
        
        # Step 3: Convert to file
        update_job(job_id, status="converting")
        if file_type == "pdf":
            file_path = convert_to_pdf(normalized_results, job_id)
        else:
            file_path = convert_to_excel(normalized_results, job_id)
        
        completed_at = time.time()
        process_time = completed_at - started_at
        
        update_job(
            job_id,
            result=normalized_results,
            file_path=file_path,
            file_type=file_type,
            chat_id=chat_id,
            status="done",
            completed_at=completed_at
        )
        
        print(f"Job {job_id} ({engine}) completed in {process_time:.2f}s - File: {file_path} - Chat: {chat_id}")
        
    except Exception as e:
        update_job(
            job_id,
            status="failed",
            error=str(e),
            completed_at=time.time()
        )
        print(f"Job {job_id} failed: {str(e)}")
    
    # Clear images from memory
    update_job(job_id, images=None)
    
    # Send webhook if configured
    webhook = job.get("webhook")
    if webhook:
        try:
            requests.post(
                webhook,
                json={
                    "job_id": job_id, 
                    "status": "done", 
                    "file_type": job.get("file_type"),
                    "engine": job.get("engine"),
                    "chat_id": job.get("chat_id")
                },
                timeout=3
            )
        except:
            pass


def worker():
    """Background worker thread function"""
    while True:
        time.sleep(0.05)
        
        job_id = get_next_job_for_worker()
        if job_id is None:
            continue
        
        try:
            process_job(job_id)
        finally:
            clear_current_job()


def start_worker():
    """Start the background worker thread"""
    worker_thread = threading.Thread(target=worker, daemon=True)
    worker_thread.start()
    print("Background worker started")
    return worker_thread
