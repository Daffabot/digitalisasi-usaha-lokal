"""
Background Scheduler Service
"""
from apscheduler.schedulers.background import BackgroundScheduler
from services.queue_manager import cleanup_expired_jobs

scheduler = None


def start_scheduler():
    """Initialize and start the background scheduler"""
    global scheduler
    
    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(
        cleanup_expired_jobs,
        'interval',
        hours=12,
        max_instances=1,
        coalesce=True
    )
    scheduler.start()
    print("Background scheduler started")
    
    return scheduler


def shutdown_scheduler():
    """Shutdown the scheduler"""
    global scheduler
    if scheduler:
        scheduler.shutdown()
        print("Scheduler shutdown complete")
