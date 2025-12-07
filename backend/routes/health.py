"""
Health and Stats Routes
"""
import time
from flask import Blueprint, jsonify

from config import MAX_QUEUE_SIZE, AVG_TIME
from core.queue_manager import get_queue_stats, get_current_job

health_bp = Blueprint('health', __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    stats = get_queue_stats()
    
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "ocr_engine": "PaddleOCR",
        "queue_size": stats["queue_length"],
        "active_jobs": stats["total_jobs"]
    })


@health_bp.route("/stats", methods=["GET"])
def stats():
    """Server statistics endpoint"""
    queue_stats = get_queue_stats()
    
    return jsonify({
        "queue_length": queue_stats["queue_length"],
        "total_jobs": queue_stats["total_jobs"],
        "current_job": queue_stats["current_job"],
        "max_queue_size": MAX_QUEUE_SIZE,
        "avg_processing_time": AVG_TIME,
        "ocr_engine": "PaddleOCR",
        "engine_info": {
            "languages": ["en", "id", "multi"],
            "device": "cpu",
            "textline_orientation_enabled": True
        }
    })
