from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, content, profile, share
from app.seed import seed_posts
from app.youtube_sync import sync_all_playlists, PLAYLIST_IDS

app = FastAPI(title='WishScroll API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.on_event('startup')
async def startup():
    Base.metadata.create_all(bind=engine)
    if PLAYLIST_IDS:
        print("[startup] YouTube playlists detected, syncing...")
        sync_all_playlists()
    else:
        print("[startup] No YouTube playlists configured, using demo seed data")
        seed_posts()

app.include_router(auth.router,     prefix='/api/v1/auth',    tags=['auth'])
app.include_router(content.router,  prefix='/api/v1/content', tags=['content'])
app.include_router(profile.router,  prefix='/api/v1/profile', tags=['profile'])
app.include_router(share.router,    prefix='/api/v1/share',   tags=['share'])

@app.get('/')
def root():
    return {'message': 'WishScroll API running!'}

@app.post('/api/v1/admin/sync')
def manual_sync():
    if not PLAYLIST_IDS:
        return {'error': 'No playlist IDs configured in youtube_sync.py'}
    sync_all_playlists()
    return {'message': f'Synced {len(PLAYLIST_IDS)} playlists successfully'}