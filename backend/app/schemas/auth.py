from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
import uuid

# Request schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True
