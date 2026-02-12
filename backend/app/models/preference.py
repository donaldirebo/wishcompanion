from sqlalchemy import String, ForeignKey, func, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from datetime import datetime
import uuid
from app.database import Base

class Preference(Base):
    __tablename__ = "preferences"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    preferred_tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    blocked_tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    settings: Mapped[dict] = mapped_column(JSONB, default=dict)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user: Mapped["User"] = relationship(back_populates="preferences")
    
    def __repr__(self):
        return f"<Preference(user_id={self.user_id})>"
