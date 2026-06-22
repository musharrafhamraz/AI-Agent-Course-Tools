from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict
# pyrefly: ignore [missing-import]
import asyncpg
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class CustomTask(BaseModel):
    category: str
    task_name: str
    task_description: str
    frequency: str = "weekly"
    complexity: str = "medium"

@router.get("/me")
async def get_my_tasks(
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get all tasks for the current user
    """
    try:
        user_id = current_user['userId']
        profile_id = await db.fetchval("SELECT id FROM user_profiles WHERE user_id = $1", user_id)
        
        if not profile_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
            
        tasks = await db.fetch("SELECT * FROM job_tasks WHERE user_profile_id = $1 AND is_approved = true", profile_id)
        return [dict(task) for task in tasks]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user tasks: {str(e)}"
        )

@router.post("/me")
async def add_custom_task(
    task: CustomTask,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Add a new custom task to the user profile
    """
    try:
        user_id = current_user['userId']
        profile_id = await db.fetchval("SELECT id FROM user_profiles WHERE user_id = $1", user_id)
        
        if not profile_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
            
        task_id = await db.fetchval(
            """
            INSERT INTO job_tasks (user_profile_id, category, task_name, task_description, frequency, complexity, is_approved, is_custom)
            VALUES ($1, $2, $3, $4, $5, $6, true, true)
            RETURNING id
            """,
            profile_id, task.category, task.task_name, task.task_description, task.frequency, task.complexity
        )
        return {"id": task_id, "message": "Task created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding task: {str(e)}"
        )

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Delete a task belonging to the user
    """
    try:
        user_id = current_user['userId']
        profile_id = await db.fetchval("SELECT id FROM user_profiles WHERE user_id = $1", user_id)
        
        if not profile_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
            
        result = await db.execute("DELETE FROM job_tasks WHERE id = $1 AND user_profile_id = $2", task_id, profile_id)
        
        if result == "DELETE 0":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or not authorized")
            
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting task: {str(e)}"
        )
