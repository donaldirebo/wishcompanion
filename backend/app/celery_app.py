from celery import Celery
from celery.schedules import crontab
from app.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

celery_app = Celery(
    'wishscroll',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

# Production configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Production settings
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    task_soft_time_limit=3000,  # 50 min soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    
    # Retry configuration
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # Result backend settings
    result_expires=86400,  # 24 hours
    result_persistent=True,
)

# Production schedule - every hour
celery_app.conf.beat_schedule = {
    'fetch-content-hourly': {
        'task': 'app.tasks.content_tasks.fetch_content_task',
        'schedule': crontab(minute=0),  # Every hour
        'options': {
            'expires': 3000,  # Task expires in 50 minutes
        }
    },
}

celery_app.conf.task_routes = {
    'app.tasks.*': {'queue': 'default'},
}
