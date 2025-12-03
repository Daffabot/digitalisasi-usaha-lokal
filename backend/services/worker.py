"""
Background Worker Service
"""
import time
import threading
import requests

from models.ocr import run_ocr, run_ocr_enhanced
from services.queue_manager import (
    get_job, update_job,
    get_next_job_for_worker, clear_current_job
)


def process_job(job_id):
    """Process a single OCR job"""
    job = get_job(job_id)
    if job is None:
        return
    
    started_at = time.time()
    update_job(job_id, status="processing", started_at=started_at)
    
    results = []
    
    try:
        use_enhanced = job.get("use_enhanced", False)
        ocr_options = job.get("ocr_options", {})
        images = job["images"]
        job_type = job["type"]
        
        if job_type == "single":
            image = images[0]
            if use_enhanced:
                result = run_ocr_enhanced(image, ocr_options)
            else:
                result = run_ocr(image)
            results.append(result)
            
        elif job_type == "batch":
            processed = 0
            for img in images:
                if use_enhanced:
                    out = run_ocr_enhanced(img, ocr_options)
                else:
                    out = run_ocr(img)
                results.append(out)
                processed += 1
                # Only update processed count, minimize dict operations
                update_job(job_id, processed=processed)
        
        completed_at = time.time()
        process_time = completed_at - started_at
        
        update_job(
            job_id,
            result=results,
            status="done",
            completed_at=completed_at
        )
        
        print(f"Job {job_id} completed in {process_time:.2f}s")
        
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
                json={"job_id": job_id, "result": results},
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

