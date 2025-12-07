"""
Queue Management Service
"""
import uuid
import time
import threading

from config import MAX_QUEUE_SIZE, AVG_TIME, JOB_EXPIRY

# Queue state
queue = []
queue_lock = threading.Lock()
jobs = {}
CURRENT_JOB = None


def get_queue_state():
    """Get current queue state"""
    return {
        "queue": queue,
        "queue_lock": queue_lock,
        "jobs": jobs,
        "current_job": CURRENT_JOB
    }


def set_current_job(job_id):
    """Set the current job being processed"""
    global CURRENT_JOB
    CURRENT_JOB = job_id


def get_current_job():
    """Get the current job being processed"""
    return CURRENT_JOB


def create_job(job_type, images, webhook=None, use_enhanced=False, ocr_options=None, user_id=None, file_type="excel", engine="paddleocr"):
    """
    Create a new OCR job
    
    Args:
        job_type: 'single' or 'batch'
        images: List of PIL Images
        webhook: Optional webhook URL for completion notification
        use_enhanced: Whether to use enhanced OCR mode
        ocr_options: Optional OCR configuration options
        user_id: ID of the user who created the job
        file_type: Output file type ('excel' or 'pdf')
        engine: OCR engine to use ('paddleocr' or 'kolosalocr')
    
    Returns:
        Tuple of (job_id, position, eta) or (None, None, None) if queue is full
    """
    with queue_lock:
        if len(queue) >= MAX_QUEUE_SIZE:
            return None, None, None
        
        job_id = str(uuid.uuid4())
        total_img = len(images)
        
        job_data = {
            "id": job_id,
            "type": job_type,
            "images": images,
            "status": "queued",
            "result": None,
            "file_path": None,
            "file_type": file_type,
            "engine": engine,  # Add engine field
            "chat_id": None,
            "total_images": total_img,
            "processed": 0,
            "webhook": webhook,
            "use_enhanced": use_enhanced,
            "ocr_options": ocr_options or {},
            "created_at": time.time(),
            "user_id": user_id
        }
        
        jobs[job_id] = job_data
        queue.append(job_id)
        position = len(queue) - 1
        eta = (position * AVG_TIME) + (AVG_TIME * total_img)
    
    return job_id, position, eta


def get_job(job_id):
    """Get a job by ID"""
    return jobs.get(job_id)


def update_job(job_id, **kwargs):
    """Update job properties"""
    if job_id in jobs:
        jobs[job_id].update(kwargs)


def delete_job(job_id):
    """Delete a job"""
    if job_id in jobs:
        del jobs[job_id]


def get_job_position(job_id):
    """Get job position in queue"""
    with queue_lock:
        try:
            return queue.index(job_id) if job_id in queue else 0
        except ValueError:
            return 0


def _pop_next_job_internal():
    """Pop the next job from the queue (internal - no lock)"""
    if len(queue) == 0:
        return None
    return queue.pop(0)


def pop_next_job():
    """Pop the next job from the queue (thread-safe)"""
    with queue_lock:
        return _pop_next_job_internal()


def get_next_job_for_worker():
    """
    Atomically get next job for worker processing.
    Returns job_id if available and no current job, None otherwise.
    """
    global CURRENT_JOB
    with queue_lock:
        if CURRENT_JOB is not None:
            return None
        if len(queue) == 0:
            return None
        job_id = queue.pop(0)
        CURRENT_JOB = job_id
        return job_id


def clear_current_job():
    """Clear the current job being processed"""
    global CURRENT_JOB
    with queue_lock:
        CURRENT_JOB = None


def cleanup_expired_jobs():
    """Clean up jobs older than JOB_EXPIRY"""
    current_time = time.time()
    
    with queue_lock:
        expired = [
            jid for jid, job in jobs.items()
            if (current_time - job.get("created_at", current_time)) > JOB_EXPIRY
        ]
        
        for jid in expired:
            del jobs[jid]
    
    if expired:
        print(f"Cleaned up {len(expired)} jobs older than 12 hours")


def get_queue_stats():
    """Get queue statistics"""
    with queue_lock:
        return {
            "queue_length": len(queue),
            "total_jobs": len(jobs),
            "current_job": CURRENT_JOB,
            "max_queue_size": MAX_QUEUE_SIZE
        }