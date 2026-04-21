from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import base64, os, secrets
from app.database import get_db
from app.models import User, Interaction, Post, CategoryLike
from app.auth import get_current_user, hash_password, verify_password

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class CategoryLikeRequest(BaseModel):
    category: str

@router.get('/')
def get_profile(u: User = Depends(get_current_user)):
    return {'id': u.id, 'email': u.email, 'name': u.name, 'avatar_url': u.avatar_url, 'share_token': u.share_token}

@router.put('/')
def update_profile(req: ProfileUpdate, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    if req.name: u.name = req.name
    if req.avatar_url: u.avatar_url = req.avatar_url
    db.commit()
    return {'success': True}

@router.post('/avatar')
async def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail='Only image files are allowed (jpg, png, gif, webp)')
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail='File too large. Maximum size is 5MB')
    b64 = base64.b64encode(contents).decode('utf-8')
    data_url = f"data:{file.content_type};base64,{b64}"
    u.avatar_url = data_url
    db.commit()
    return {'success': True, 'avatar_url': data_url}

@router.post('/media')
async def upload_media(file: UploadFile = File(...), db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    allowed_images = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    allowed_videos = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    allowed = allowed_images + allowed_videos
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail='Only image or video files are allowed')
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail='File too large. Maximum size is 20MB')
    b64 = base64.b64encode(contents).decode('utf-8')
    data_url = f"data:{file.content_type};base64,{b64}"
    content_type = 'video' if file.content_type in allowed_videos else 'image'
    post = Post(
        title=f"{u.name or u.email.split('@')[0]}'s memory",
        content_url=data_url,
        content_type=content_type,
        source='personal',
        tags=f'personal,user_{u.id}',
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {'success': True, 'post_id': post.id, 'content_type': content_type}

@router.get('/media')
def get_my_media(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    posts = db.query(Post).filter(Post.tags.like(f'%user_{u.id}%')).all()
    return [{'id': p.id, 'title': p.title, 'content_url': p.content_url, 'content_type': p.content_type, 'created_at': p.created_at} for p in posts]

@router.delete('/media/{post_id}')
def delete_media(post_id: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.tags.like(f'%user_{u.id}%')).first()
    if not post:
        raise HTTPException(status_code=404, detail='Media not found')
    db.delete(post)
    db.commit()
    return {'success': True}

@router.post('/share-link')
def generate_share_link(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    if not u.share_token:
        u.share_token = secrets.token_urlsafe(16)
        db.commit()
    return {'share_token': u.share_token, 'share_url': f'/share/{u.share_token}'}

@router.get('/share-link')
def get_share_link(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return {'share_token': u.share_token, 'share_url': f'/share/{u.share_token}' if u.share_token else None}

@router.post('/likes/category')
def like_category(req: CategoryLikeRequest, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    like = CategoryLike(user_id=u.id, category=req.category)
    db.add(like)
    db.commit()
    return {'success': True}

@router.get('/likes/categories')
def get_liked_categories(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    likes = db.query(CategoryLike).filter(CategoryLike.user_id == u.id).order_by(CategoryLike.created_at.desc()).all()
    return [{'id': l.id, 'category': l.category, 'created_at': l.created_at} for l in likes]

@router.delete('/likes/category/{like_id}')
def delete_liked_category(like_id: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    like = db.query(CategoryLike).filter(CategoryLike.id == like_id, CategoryLike.user_id == u.id).first()
    if not like:
        raise HTTPException(status_code=404, detail='Like not found')
    db.delete(like)
    db.commit()
    return {'success': True}

@router.post('/change-password')
def change_password(req: PasswordChange, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    if not verify_password(req.current_password, u.hashed_password):
        raise HTTPException(status_code=400, detail='Current password is incorrect')
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail='New password must be at least 6 characters')
    u.hashed_password = hash_password(req.new_password)
    db.commit()
    return {'success': True, 'message': 'Password changed successfully'}

@router.get('/stats')
def stats(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return {
        'likes':    db.query(Interaction).filter(Interaction.user_id == u.id, Interaction.interaction_type == 'like').count(),
        'saves':    db.query(Interaction).filter(Interaction.user_id == u.id, Interaction.interaction_type == 'save').count(),
        'dislikes': db.query(Interaction).filter(Interaction.user_id == u.id, Interaction.interaction_type == 'dislike').count(),
    }