from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()

@router.post("/register")
async def register(db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # TODO: Implement in Issue #26
    return {"message": "Registration endpoint - TODO"}

@router.post("/login")
async def login(db: AsyncSession = Depends(get_db)):
    """Login and receive JWT token"""
    # TODO: Implement in Issue #26
    return {"message": "Login endpoint - TODO"}

@router.post("/logout")
async def logout():
    """Logout (invalidate token)"""
    # TODO: Implement in Issue #26
    return {"message": "Logout endpoint - TODO"}

@router.get("/me")
async def get_current_user():
    """Get current authenticated user"""
    # TODO: Implement in Issue #26
    return {"message": "Current user endpoint - TODO"}
