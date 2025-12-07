"""
OCR Routes
"""
import os
import time
from flask import Blueprint, request, jsonify, g, send_file

from config import MAX_BATCH_SIZE, AVG_TIME, DOWNLOAD_DIR
from utils.helpers import allowed_size, parse_ocr_options, load_image_from_file
from core.queue_manager import create_job, get_job, delete_job, get_job_position
from ml.ocr import run_ocr_paddleocr, run_ocr_enhanced
from ml.kolosal_ocr import run_ocr_kolosal, format_kolosal_result_for_file
from middleware.auth import jwt_required
from utils.ai_formatter import parse_json_from_response
from services.chat_service import format_text_via_chat
from services.file_converter_service import convert_to_excel, convert_to_pdf, ensure_download_dir

ocr_bp = Blueprint('ocr', __name__)

VALID_FILE_TYPES = ["excel", "pdf"]
VALID_ENGINES = ["paddleocr", "kolosalocr"]


@ocr_bp.route("/ocr", methods=["POST"])
@jwt_required
def ocr_single():
    """Single image OCR with queue (requires authentication)"""
    if "image" not in request.files:
        return jsonify({"error": "image is required"}), 400
    
    file_type = request.form.get("file-type")
    if not file_type:
        return jsonify({"error": "file-type is required (excel or pdf)"}), 400
    if file_type not in VALID_FILE_TYPES:
        return jsonify({"error": "file-type must be 'excel' or 'pdf'"}), 400
    
    engine = request.form.get("engine", "kolosalocr").lower()
    if engine not in VALID_ENGINES:
        return jsonify({"error": f"engine must be one of: {', '.join(VALID_ENGINES)}"}), 400
    
    file = request.files["image"]
    
    if not allowed_size(file):
        return jsonify({"error": "Image exceeds 2MB"}), 413
    
    image, error = load_image_from_file(file)
    if error:
        return jsonify({"error": "Invalid image"}), 400
    
    webhook = request.form.get("webhook")
    use_enhanced = request.form.get("use_enhanced", "false").lower() == "true"
    
    ocr_options = {}
    if use_enhanced:
        ocr_options = parse_ocr_options(request.form)
    
    if engine == "kolosalocr":
        ocr_options["auto_fix"] = request.form.get("auto_fix", "true").lower() == "true"
        ocr_options["invoice"] = request.form.get("invoice", "false").lower() == "true"
        ocr_options["language"] = request.form.get("language", "auto")
    
    job_id, position, eta = create_job(
        "single", [image], webhook,
        use_enhanced, ocr_options,
        user_id=g.current_user["id"],
        file_type=file_type,
        engine=engine
    )
    
    if job_id is None:
        return jsonify({"error": "Queue is full, try again later"}), 503
    
    return jsonify({
        "job_id": job_id,
        "status": "queued",
        "position": position,
        "eta_seconds": eta,
        "enhanced_mode": use_enhanced,
        "engine": engine,
        "file_type": file_type,
        "user": g.current_user["username"]
    })


@ocr_bp.route("/ocr/batch", methods=["POST"])
@jwt_required
def ocr_batch():
    """Batch image OCR with queue (requires authentication)"""
    file_type = request.form.get("file-type")
    if not file_type:
        return jsonify({"error": "file-type is required (excel or pdf)"}), 400
    if file_type not in VALID_FILE_TYPES:
        return jsonify({"error": "file-type must be 'excel' or 'pdf'"}), 400
    
    engine = request.form.get("engine", "kolosalocr").lower()
    if engine not in VALID_ENGINES:
        return jsonify({"error": f"engine must be one of: {', '.join(VALID_ENGINES)}"}), 400
    
    files = request.files.getlist("images")
    
    if len(files) == 0:
        return jsonify({"error": "No images uploaded"}), 400
    
    if len(files) > MAX_BATCH_SIZE:
        return jsonify({"error": f"Max {MAX_BATCH_SIZE} images allowed"}), 400
    
    images = []
    errors = []
    
    for idx, f in enumerate(files):
        if not allowed_size(f):
            errors.append({"index": idx, "error": "exceeds 2MB"})
            continue
        
        image, error = load_image_from_file(f)
        if error:
            errors.append({"index": idx, "error": "invalid image"})
        else:
            images.append(image)
    
    if len(images) == 0:
        return jsonify({"error": "No valid images"}), 400
    
    webhook = request.form.get("webhook")
    use_enhanced = request.form.get("use_enhanced", "false").lower() == "true"
    
    ocr_options = {}
    if use_enhanced:
        ocr_options = parse_ocr_options(request.form)
    
    if engine == "kolosalocr":
        ocr_options["auto_fix"] = request.form.get("auto_fix", "true").lower() == "true"
        ocr_options["invoice"] = request.form.get("invoice", "false").lower() == "true"
        ocr_options["language"] = request.form.get("language", "auto")
    
    job_id, position, eta = create_job(
        "batch", images, webhook,
        use_enhanced, ocr_options,
        user_id=g.current_user["id"],
        file_type=file_type,
        engine=engine
    )
    
    if job_id is None:
        return jsonify({"error": "Queue is full, try again later"}), 503
    
    return jsonify({
        "job_id": job_id,
        "status": "queued",
        "position": position,
        "eta_seconds": eta,
        "valid_images": len(images),
        "enhanced_mode": use_enhanced,
        "engine": engine,
        "file_type": file_type,
        "errors": errors if errors else None,
        "user": g.current_user["username"]
    })


@ocr_bp.route("/ocr/direct", methods=["POST"])
@jwt_required
def ocr_direct():
    """Direct OCR endpoint without queue - returns file directly (requires authentication)"""
    if "image" not in request.files:
        return jsonify({"error": "image is required"}), 400
    
    file_type = request.form.get("file-type")
    if not file_type:
        return jsonify({"error": "file-type is required (excel or pdf)"}), 400
    if file_type not in VALID_FILE_TYPES:
        return jsonify({"error": "file-type must be 'excel' or 'pdf'"}), 400
    
    engine = request.form.get("engine", "kolosalocr").lower()
    if engine not in VALID_ENGINES:
        return jsonify({"error": f"engine must be one of: {', '.join(VALID_ENGINES)}"}), 400
    
    file = request.files["image"]
    
    if not allowed_size(file):
        return jsonify({"error": "Image exceeds 2MB"}), 413
    
    image, error = load_image_from_file(file)
    if error:
        return jsonify({"error": "Invalid image"}), 400
    
    use_enhanced = request.form.get("use_enhanced", "false").lower() == "true"
    detail = int(request.form.get("detail", "0"))
    lang = request.form.get("lang", "en")
    min_confidence = float(request.form.get("min_confidence", "0.3"))
    
    try:
        import uuid
        job_id = str(uuid.uuid4())
        start_time = time.time()
        
        if engine == "kolosalocr":
            kolosal_options = {
                "auto_fix": request.form.get("auto_fix", "true").lower() == "true",
                "invoice": request.form.get("invoice", "false").lower() == "true",
                "language": request.form.get("language", "auto")
            }
            kolosal_result = run_ocr_kolosal(image, kolosal_options)
            normalized = format_kolosal_result_for_file(kolosal_result)
            normalized_results = [normalized]
        else:
            if use_enhanced:
                ocr_options = {
                    "detail": detail,
                    "lang": lang,
                    "min_confidence": min_confidence,
                    "merge_lines": request.form.get("merge_lines", "true").lower() == "true"
                }
                result = run_ocr_enhanced(image, ocr_options)
            else:
                result = run_ocr_paddleocr(image, detail=detail, lang=lang)
            
            # Format via chat service if user is authenticated
            user_id = g.current_user.get("id") if g.current_user else None
            if user_id:
                chat_result = format_text_via_chat(user_id, result)
                if "error" not in chat_result:
                    ai_response = chat_result.get("response", "")
                    normalized = parse_json_from_response(ai_response)
                else:
                    normalized = {"data": result, "is_json": False}
            else:
                normalized = {"data": result, "is_json": False}
            
            normalized_results = [normalized]
        
        if file_type == "pdf":
            file_path = convert_to_pdf(normalized_results, job_id)
            mimetype = "application/pdf"
            download_name = f"ocr_result_{job_id}.pdf"
        else:
            file_path = convert_to_excel(normalized_results, job_id)
            mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            download_name = f"ocr_result_{job_id}.xlsx"
        
        processing_time = time.time() - start_time
        print(f"Direct OCR ({engine}) completed in {processing_time:.2f}s - File: {file_path}")
        
        return send_file(
            file_path,
            mimetype=mimetype,
            as_attachment=True,
            download_name=download_name
        )
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@ocr_bp.route("/take/<job_id>", methods=["GET"])
@jwt_required
def take(job_id):
    """Get job status and download link (requires authentication)"""
    job = get_job(job_id)
    
    if job is None:
        return jsonify({"error": "job not found"}), 404
    
    if job.get("user_id") and job.get("user_id") != g.current_user["id"]:
        return jsonify({"error": "Unauthorized to access this job"}), 403
    
    if job["status"] in ["queued", "processing", "formatting", "converting"]:
        position = get_job_position(job_id)
        eta = (position * AVG_TIME) + (AVG_TIME * (job["total_images"] - job["processed"]))
        
        status_messages = {
            "queued": "Waiting in queue",
            "processing": "Processing OCR",
            "formatting": "Formatting with AI",
            "converting": "Converting to file"
        }
        
        return jsonify({
            "job_id": job_id,
            "status": job["status"],
            "status_message": status_messages.get(job["status"], job["status"]),
            "position": position,
            "progress": f"{job['processed']}/{job['total_images']}",
            "eta_seconds": eta,
            "enhanced_mode": job.get("use_enhanced", False),
            "file_type": job.get("file_type", "excel"),
            "chat_id": job.get("chat_id")
        })
    
    if job["status"] == "failed":
        error_data = {
            "job_id": job_id,
            "status": "failed",
            "error": job.get("error"),
            "chat_id": job.get("chat_id")
        }
        delete_job(job_id)
        return jsonify(error_data), 500
    
    if job["status"] == "done":
        file_path = job.get("file_path")
        file_type = job.get("file_type", "excel")
        chat_id = job.get("chat_id")
        
        if not file_path or not os.path.exists(file_path):
            delete_job(job_id)
            return jsonify({"error": "File not found"}), 404
        
        filename = os.path.basename(file_path)
        
        return jsonify({
            "job_id": job_id,
            "status": "done",
            "file_type": file_type,
            "chat_id": chat_id,
            "download_url": f"/download/{filename}"
        })
    
    return jsonify({"error": "Unknown job status"}), 500


@ocr_bp.route("/download/<filename>", methods=["GET"])
@jwt_required
def download_file(filename):
    """Download file by filename (requires authentication)"""
    if ".." in filename or "/" in filename or "\\" in filename:
        return jsonify({"error": "Invalid filename"}), 400
    
    file_path = os.path.join(DOWNLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    if filename.endswith(".pdf"):
        mimetype = "application/pdf"
    elif filename.endswith(".xlsx"):
        mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        mimetype = "application/octet-stream"
    
    return send_file(
        file_path,
        mimetype=mimetype,
        as_attachment=True,
        download_name=filename
    )