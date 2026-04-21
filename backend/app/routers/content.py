from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import Post, Interaction, User
from app.auth import get_current_user

router = APIRouter()

class InteractRequest(BaseModel):
    interaction_type: str
    dwell_time_seconds: int = 0

def to_resp(p):
    return {'id': p.id, 'title': p.title, 'content_url': p.content_url, 'content_type': p.content_type, 'source': p.source, 'tags': [t.strip() for t in p.tags.split(',')] if p.tags else []}

@router.get('/new')
def get_new(limit: int = 30, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return [to_resp(p) for p in db.query(Post).order_by(Post.id.desc()).limit(limit).all()]

@router.get('/feed')
def get_feed(limit: int = 30, offset: int = 0, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return [to_resp(p) for p in db.query(Post).offset(offset).limit(limit).all()]

@router.get('/favorites')
def get_favorites(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    ids = [i.post_id for i in db.query(Interaction).filter(Interaction.user_id == u.id, Interaction.interaction_type == 'save').all()]
    return [to_resp(p) for p in db.query(Post).filter(Post.id.in_(ids)).all()]

@router.post('/{post_id}/interact')
def interact(post_id: int, req: InteractRequest, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    if not db.query(Post).filter(Post.id == post_id).first():
        raise HTTPException(status_code=404, detail='Post not found')
    db.query(Interaction).filter(Interaction.user_id == u.id, Interaction.post_id == post_id).delete()
    db.add(Interaction(user_id=u.id, post_id=post_id, interaction_type=req.interaction_type, dwell_time_seconds=req.dwell_time_seconds))
    db.commit()
    return {'success': True}
