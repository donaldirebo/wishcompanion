from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.database import get_db
from app.models import User, Post, Interaction
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/stats/overview")
async def get_system_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get system-wide statistics"""
    
    # Total counts
    total_users = await db.execute(select(func.count()).select_from(User))
    total_posts = await db.execute(select(func.count()).select_from(Post))
    total_interactions = await db.execute(select(func.count()).select_from(Interaction))
    
    # Content by source
    content_by_source = await db.execute(
        select(Post.source, Post.content_type, func.count()).
        group_by(Post.source, Post.content_type)
    )
    
    # Safe vs blocked content
    safe_posts = await db.execute(
        select(func.count()).select_from(Post).where(Post.sentiment_score >= 0.0)
    )
    total_posts_count = total_posts.scalar()
    safe_count = safe_posts.scalar()
    blocked_count = total_posts_count - safe_count
    
    # Interaction breakdown
    interaction_breakdown = await db.execute(
        select(Interaction.interaction_type, func.count()).
        group_by(Interaction.interaction_type)
    )
    
    return {
        "system": {
            "total_users": total_users.scalar(),
            "total_posts": total_posts_count,
            "total_interactions": total_interactions.scalar(),
        },
        "content": {
            "by_source": [
                {"source": row[0], "type": row[1], "count": row[2]}
                for row in content_by_source.all()
            ],
            "safe_posts": safe_count,
            "blocked_posts": blocked_count,
            "filter_rate": f"{(blocked_count/total_posts_count*100):.1f}%" if total_posts_count > 0 else "0%"
        },
        "interactions": {
            row[0]: row[1] for row in interaction_breakdown.all()
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/stats/content-health")
async def get_content_health(db: AsyncSession = Depends(get_db)):
    """Check content freshness and diversity"""
    
    # Posts added in last 24 hours
    yesterday = datetime.utcnow() - timedelta(hours=24)
    recent_posts = await db.execute(
        select(func.count()).select_from(Post).
        where(Post.created_at >= yesterday)
    )
    
    # Average sentiment score
    avg_sentiment = await db.execute(
        select(func.avg(Post.sentiment_score)).select_from(Post)
    )
    
    # Tag diversity
    all_tags = await db.execute(
        select(func.unnest(Post.tags), func.count()).
        group_by(func.unnest(Post.tags)).
        order_by(func.count().desc()).
        limit(10)
    )
    
    return {
        "freshness": {
            "posts_last_24h": recent_posts.scalar(),
            "needs_refresh": recent_posts.scalar() < 50
        },
        "quality": {
            "avg_sentiment": round(avg_sentiment.scalar() or 0, 2),
            "is_positive": (avg_sentiment.scalar() or 0) > 0.3
        },
        "diversity": {
            "top_tags": [
                {"tag": row[0], "count": row[1]}
                for row in all_tags.all()
            ]
        }
    }
