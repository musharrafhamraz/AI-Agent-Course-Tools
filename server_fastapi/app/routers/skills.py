from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict
# pyrefly: ignore [missing-import]
import asyncpg
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("/")
async def get_all_skills(db: asyncpg.Connection = Depends(get_db)):
    """
    Get all available skills from the taxonomy
    """
    try:
        skills = await db.fetch("SELECT * FROM skill_taxonomy ORDER BY skill_category, skill_name")
        return [dict(skill) for skill in skills]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching skills: {str(e)}"
        )

@router.get("/me")
async def get_my_skills(
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get skills the current user is learning or has mastered
    """
    try:
        user_id = current_user['userId']
        
        profile = await db.fetchval("SELECT id FROM user_profiles WHERE user_id = $1", user_id)
        if not profile:
            return []
            
        # Return empty list as placeholder until progress tracking is fully associated with specific skills
        return []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user skills: {str(e)}"
        )
