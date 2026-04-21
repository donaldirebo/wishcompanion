from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import base64
from app.database import get_db
from app.models import User, Post

router = APIRouter()

@router.get('/{token}')
def get_share_page(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.share_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail='Share link not found')
    posts = db.query(Post).filter(Post.tags.like(f'%user_{user.id}%')).all()
    return {
        'owner_name': user.name or user.email.split('@')[0],
        'media': [{'id': p.id, 'title': p.title, 'content_url': p.content_url, 'content_type': p.content_type} for p in posts]
    }

@router.post('/{token}/upload')
async def share_upload(token: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.share_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail='Share link not found')
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
        title=f"Shared to {user.name or user.email.split('@')[0]}",
        content_url=data_url,
        content_type=content_type,
        source='shared',
        tags=f'personal,user_{user.id},shared',
    )
    db.add(post)
    db.commit()
    return {'success': True}