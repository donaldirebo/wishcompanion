from sqlalchemy import String, DateTime, Float, func, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from datetime import datetime
import uuid
from app.database import Base

class Post(Base):
    __tablename__ = "posts"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    
    source: Mapped[str] = mapped_column(String(50), nullable=False)  # 'reddit' or 'imgur'
    title: Mapped[str] = mapped_column(Text, nullable=True)
    content_url: Mapped[str] = mapped_column(Text, nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'image', 'video', 'text'
    
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    post_metadata: Mapped[dict] = mapped_column(JSONB, default=dict)  # RENAMED from 'metadata'
    sentiment_score: Mapped[float] = mapped_column(Float, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    interactions: Mapped[list["Interaction"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_posts_source_created', 'source', 'created_at'),
        Index('idx_posts_tags', 'tags', postgresql_using='gin'),
    )
    
    def __repr__(self):
        return f"<Post(id={self.id}, source={self.source})>"
