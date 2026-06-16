from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.security import decode_access_token
from app.database import get_db
import asyncpg

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """
    Dependency to get current user ID from JWT token
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: int = payload.get("userId")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    return user_id

async def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: asyncpg.Connection = Depends(get_db)
) -> dict:
    """
    Dependency to get full current user data
    """
    query = "SELECT id, email, full_name, created_at FROM users WHERE id = $1"
    user = await db.fetchrow(query, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "userId": user['id'],
        "email": user['email'],
        "full_name": user['full_name'],
        "created_at": user['created_at']
    }
