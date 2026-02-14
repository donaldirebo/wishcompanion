from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.services.content_ingestion import content_ingestion_service
import asyncio

@celery_app.task(name='app.tasks.content_tasks.fetch_content_task')
def fetch_content_task():
    """Scheduled task to fetch content from RSS feeds every hour"""
    
    print("Starting scheduled content fetch...")
    
    async def run_ingestion():
        async with AsyncSessionLocal() as db:
            saved = await content_ingestion_service.ingest_all_content(db)
            return saved
    
    saved_count = asyncio.run(run_ingestion())
    
    print(f"Content fetch complete. Saved {saved_count} new posts.")
    return saved_count
