from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.services.content_ingestion import content_ingestion_service
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

@celery_app.task(
    name='app.tasks.content_tasks.fetch_content_task',
    bind=True,
    max_retries=3,
    default_retry_delay=300
)
def fetch_content_task(self):
    """Production task to fetch content hourly with retry logic"""
    
    start_time = datetime.utcnow()
    logger.info(f"Starting content fetch at {start_time}")
    
    try:
        async def run_ingestion():
            async with AsyncSessionLocal() as db:
                saved = await content_ingestion_service.ingest_all_content(db)
                return saved
        
        saved_count = asyncio.run(run_ingestion())
        
        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()
        
        logger.info(f"Content fetch complete. Saved: {saved_count}, Duration: {duration}s")
        
        return {
            'status': 'success',
            'saved': saved_count,
            'duration_seconds': duration,
            'timestamp': end_time.isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Content fetch failed: {exc}")
        
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error("Max retries exceeded")
            return {'status': 'failed', 'error': str(exc)}
