from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    'wishscroll',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Schedule tasks
celery_app.conf.beat_schedule = {
    'fetch-content-hourly': {
        'task': 'app.tasks.content_tasks.fetch_content_task',
        'schedule': crontab(minute=0),  # Every hour at minute 0
    },
}

celery_app.conf.task_routes = {
    'app.tasks.*': {'queue': 'default'},
}
