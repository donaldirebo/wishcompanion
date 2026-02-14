# Production Deployment Guide

## Railway Backend
1. Deploy PostgreSQL + Redis
2. Deploy backend from GitHub
3. Set environment variables (DATABASE_URL, REDIS_URL, SECRET_KEY)
4. Deploy Celery worker and beat

## Vercel Frontend  
1. Deploy from GitHub (frontend directory)
2. Set VITE_API_URL to Railway backend URL

## Environment
See .env.production.example for all variables

## Verify
- Health: GET /health
- Docs: /docs
- Admin stats: /api/v1/admin/stats/overview
