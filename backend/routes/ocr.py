"""
OCR Routes
"""
import time
from flask import Blueprint, request, jsonify

from config import MAX_BATCH_SIZE, AVG_TIME
from utils.helpers import allowed_size, parse_ocr_options, load_image_from_file
from services.queue_manager import create_job, get_job, delete_job, get_job_position
from models.ocr import run_ocr_paddleocr, run_ocr_enhanced

ocr_bp = Blueprint('ocr', __name__)


@ocr_bp.route("/ocr", methods=["POST"])
def ocr_single():
    """Single image OCR with queue"""
    if "image" not in request.files:
        return jsonify({"error": "image is required"}), 400
    
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
    
    job_id, position, eta = create_job(
        "single", [image], webhook,
        use_enhanced, ocr_options
    )
    
    if job_id is None:
        return jsonify({"error": "Queue is full, try again later"}), 503
    
    return jsonify({
        "job_id": job_id,
        "status": "queued",
        "position": position,
        "eta_seconds": eta,
        "enhanced_mode": use_enhanced
    })


@ocr_bp.route("/ocr/batch", methods=["POST"])
def ocr_batch():
    """Batch image OCR with queue"""
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
    
    job_id, position, eta = create_job(
        "batch", images, webhook,
        use_enhanced, ocr_options
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
        "errors": errors if errors else None
    })


@ocr_bp.route("/ocr/direct", methods=["POST"])
def ocr_direct():
    """Direct OCR endpoint without queue system"""
    if "image" not in request.files:
        return jsonify({"error": "image is required"}), 400
    
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
        start_time = time.time()
        
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
        
        processing_time = time.time() - start_time
        
        return jsonify({
            "status": "success",
            "result": result,
            "processing_time": round(processing_time, 2),
            "enhanced_mode": use_enhanced
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@ocr_bp.route("/take/<job_id>", methods=["GET"])
def take(job_id):
    """Get job results"""
    job = get_job(job_id)
    
    if job is None:
        return jsonify({"error": "job not found"}), 404
    
    if job["status"] in ["queued", "processing"]:
        position = get_job_position(job_id)
        eta = (position * AVG_TIME) + (AVG_TIME * (job["total_images"] - job["processed"]))
        
        return jsonify({
            "job_id": job_id,
            "status": job["status"],
            "position": position,
            "progress": f"{job['processed']}/{job['total_images']}",
            "eta_seconds": eta,
            "enhanced_mode": job.get("use_enhanced", False)
        })
    
    result_data = {
        "job_id": job_id,
        "status": job["status"],
        "result": job.get("result"),
        "error": job.get("error"),
        "enhanced_mode": job.get("use_enhanced", False)
    }
    
    if job.get("started_at") and job.get("completed_at"):
        result_data["processing_time"] = round(
            job["completed_at"] - job["started_at"], 2
        )
    
    delete_job(job_id)
    
    return jsonify(result_data)
