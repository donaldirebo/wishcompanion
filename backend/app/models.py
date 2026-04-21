from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import secrets
from app.database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    share_token = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    interactions = relationship('Interaction', back_populates='user')
    category_likes = relationship('CategoryLike', back_populates='user')

class Post(Base):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content_url = Column(String, nullable=False)
    content_type = Column(String, default='image')
    source = Column(String, default='curated')
    tags = Column(String, default='')
    created_at = Column(DateTime, default=datetime.utcnow)
    interactions = relationship('Interaction', back_populates='post')

class Interaction(Base):
    __tablename__ = 'interactions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    interaction_type = Column(String, nullable=False)
    dwell_time_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='interactions')
    post = relationship('Post', back_populates='interactions')

class CategoryLike(Base):
    __tablename__ = 'category_likes'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='category_likes')