from sqlalchemy import String, DateTime, Integer, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base

class Interaction(Base):
    __tablename__ = "interactions"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    
    interaction_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'like', 'dislike', 'save', 'share'
    dwell_time_seconds: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    user: Mapped["User"] = relationship(back_populates="interactions")
    post: Mapped["Post"] = relationship(back_populates="interactions")
    
    def __repr__(self):
        return f"<Interaction(user={self.user_id}, post={self.post_id}, type={self.interaction_type})>"
