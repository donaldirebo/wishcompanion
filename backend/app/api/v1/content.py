from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
import uuid

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Post, Interaction
from app.schemas.content import PostResponse, InteractionCreate, InteractionResponse, ContentFeedResponse

router = APIRouter()

@router.get("/feed", response_model=ContentFeedResponse)
async def get_content_feed(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get personalized content feed"""
    
    query = select(Post).where(Post.sentiment_score >= 0.0)
    
    if category:
        query = query.where(Post.tags.contains([category]))
    
    query = query.order_by(Post.created_at.desc())
    
    count_query = select(func.count()).select_from(Post).where(Post.sentiment_score >= 0.0)
    if category:
        count_query = count_query.where(Post.tags.contains([category]))
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    posts = result.scalars().all()
    
    has_more = (offset + len(posts)) < total
    
    return ContentFeedResponse(posts=posts, total=total, has_more=has_more)

@router.get("/new", response_model=list[PostResponse])
async def get_new(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get newest content"""
    
    query = (
        select(Post)
        .where(Post.sentiment_score >= 0.0)
        .order_by(Post.created_at.desc())
        .limit(limit)
    )
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/trending", response_model=list[PostResponse])
async def get_trending(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get trending content (most interactions)"""
    
    query = (
        select(Post, func.count(Interaction.id).label('interaction_count'))
        .outerjoin(Interaction, Interaction.post_id == Post.id)
        .where(Post.sentiment_score >= 0.0)
        .group_by(Post.id)
        .order_by(func.count(Interaction.id).desc(), Post.created_at.desc())
        .limit(limit)
    )
    
    result = await db.execute(query)
    return [row[0] for row in result.all()]

@router.post("/{post_id}/interact", response_model=InteractionResponse)
async def interact_with_post(
    post_id: uuid.UUID,
    interaction: InteractionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Like, dislike, save, or share a post"""
    
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_interaction = Interaction(
        user_id=current_user.id,
        post_id=post_id,
        interaction_type=interaction.interaction_type,
        dwell_time_seconds=interaction.dwell_time_seconds
    )
    
    db.add(new_interaction)
    await db.commit()
    await db.refresh(new_interaction)
    
    return new_interaction

@router.get("/favorites", response_model=list[PostResponse])
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's saved posts"""
    
    query = (
        select(Post)
        .join(Interaction)
        .where(
            and_(
                Interaction.user_id == current_user.id,
                Interaction.interaction_type == 'save'
            )
        )
        .order_by(Interaction.created_at.desc())
    )
    
    result = await db.execute(query)
    return result.scalars().all()
