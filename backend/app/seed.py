from app.database import SessionLocal
from app.models import Post

DEMO_POSTS = []

def seed_posts():
    db = SessionLocal()
    try:
        db.query(Post).delete()
        db.commit()
        print('All posts cleared!')
    finally:
        db.close()
