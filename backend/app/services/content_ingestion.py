from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Post
from app.services.youtube_service import youtube_service
from app.services.reddit_rss_service import reddit_rss_service

class ContentIngestionService:
    """Fetch content from RSS feeds and store in database"""
    
    async def ingest_all_content(self, db: AsyncSession):
        """Fetch from all sources and store in database"""
        
        print("\n🔄 Starting content ingestion...\n")
        
        # Fetch from YouTube RSS
        youtube_videos = youtube_service.fetch_videos_from_channels(max_per_channel=10)
        
        # Fetch from Reddit RSS
        reddit_posts = reddit_rss_service.fetch_posts_from_subreddits(limit_per_sub=15)
        
        # Combine all content
        all_content = youtube_videos + reddit_posts
        
        print(f"\n📦 Total content fetched: {len(all_content)}")
        print(f"   YouTube: {len(youtube_videos)}")
        print(f"   Reddit: {len(reddit_posts)}\n")
        
        # Save to database (skip duplicates)
        saved_count = 0
        skipped_count = 0
        
        for content in all_content:
            # Check if already exists
            result = await db.execute(
                select(Post).where(Post.external_id == content['external_id'])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                skipped_count += 1
                continue
            
            # Create new post
            new_post = Post(**content)
            db.add(new_post)
            saved_count += 1
        
        await db.commit()
        
        print(f"✅ Saved: {saved_count} new posts")
        print(f"⏭️  Skipped: {skipped_count} duplicates\n")
        
        return saved_count

content_ingestion_service = ContentIngestionService()
