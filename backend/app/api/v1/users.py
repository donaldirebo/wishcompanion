from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()

@router.get("/me")
async def get_user_profile(db: AsyncSession = Depends(get_db)):
    """Get current user profile"""
    # TODO: Implement
    return {"message": "User profile endpoint - TODO"}

@router.put("/preferences")
async def update_preferences(db: AsyncSession = Depends(get_db)):
    """Update user content preferences"""
    # TODO: Implement
    return {"message": "Update preferences endpoint - TODO"}

@router.get("/preferences")
async def get_preferences(db: AsyncSession = Depends(get_db)):
    """Get user preferences"""
    # TODO: Implement
    return {"message": "Get preferences endpoint - TODO"}
