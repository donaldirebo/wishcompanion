# Wishscroll Backend - Production API

Production-ready FastAPI backend for Wishscroll content curation platform.

## Features

### Core Systems
- JWT Authentication
- PostgreSQL database with 4 tables
- RSS content ingestion (YouTube + Reddit)
- 4-layer content filtering
- RESTful API (20+ endpoints)
- Celery automated tasks
- Admin monitoring

### Content Sources
- YouTube RSS (unlimited, no quotas)
- Reddit RSS (unlimited, no quotas)
- Content updated hourly via Celery

### API Endpoints

**Authentication**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me

**Content**
- GET /api/v1/content/feed (paginated, filtered)
- GET /api/v1/content/new
- GET /api/v1/content/trending
- GET /api/v1/content/top
- POST /api/v1/content/:id/interact
- GET /api/v1/content/favorites

**Admin**
- GET /api/v1/admin/stats/overview
- GET /api/v1/admin/stats/content-health

### Production Features
- Automated hourly content fetching
- Content filtering (blocks 23% negative content)
- Error handling with retry logic
- Performance indexes
- Environment-based configuration
- Comprehensive logging

## Quick Start
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload

# Start Celery worker
celery -A app.celery_app worker --loglevel=info

# Start Celery beat (scheduler)
celery -A app.celery_app beat --loglevel=info
```

## Production Deployment

See DEPLOYMENT.md for Railway deployment guide.

## Architecture

- RSS feeds = No API quotas, infinite scaling
- Redis for caching and Celery
- PostgreSQL with performance indexes
- Celery for automated tasks
- FastAPI for high-performance async API

## Database

4 tables optimized for performance:
- users (authentication)
- posts (content from YouTube/Reddit)
- interactions (user engagement)
- preferences (user settings)

## Monitoring

Real-time stats at /api/v1/admin/stats/overview

## Documentation

API docs: http://localhost:8000/docs
