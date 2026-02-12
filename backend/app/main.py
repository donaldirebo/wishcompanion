from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.v1 import auth, content, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting Wishscroll API...")
    print(f"📊 Environment: {settings.ENVIRONMENT}")
    print(f"🗄️  Database: Connected to PostgreSQL")
    
    yield
    
    # Shutdown
    print("👋 Shutting down Wishscroll API...")

app = FastAPI(
    title="Wishscroll API",
    description="Safe, positive content curation for hospital and hospice patients",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "https://wishscroll.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Wishscroll API",
        "version": "1.0.0",
        "description": "Positive content curation for patient wellbeing",
        "docs": "/docs"
    }

# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "wishscroll-api",
        "database": "connected"
    }

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(content.router, prefix="/api/v1/content", tags=["Content"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
