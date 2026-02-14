from pydantic import BaseModel
from datetime import datetime
import uuid

class PostResponse(BaseModel):
    id: uuid.UUID
    external_id: str
    source: str
    title: str
    content_url: str
    content_type: str
    tags: list[str]
    post_metadata: dict
    sentiment_score: float | None
    created_at: datetime
    
    class Config:
        from_attributes = True

class InteractionCreate(BaseModel):
    interaction_type: str  # 'like', 'dislike', 'save', 'share'
    dwell_time_seconds: int | None = None

class InteractionResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    interaction_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ContentFeedResponse(BaseModel):
    posts: list[PostResponse]
    total: int
    has_more: bool
