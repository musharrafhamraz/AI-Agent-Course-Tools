from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)
    full_name: str = Field(..., min_length=1)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    message: str
    token: str
    user: UserResponse

class ErrorResponse(BaseModel):
    error: str
class GoogleAuth(BaseModel):
    id_token: str = Field(..., description="Google ID token obtained from client")
