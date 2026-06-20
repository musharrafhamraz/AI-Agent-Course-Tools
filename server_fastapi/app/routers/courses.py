"""
Course Management Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.dependencies import get_current_user
# pyrefly: ignore [missing-import]
import asyncpg
from typing import Dict, List
import json

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("/my-courses")
async def get_my_courses(
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get all courses for the current user
    """
    try:
        user_id = current_user['userId']
        
        # Get user's courses
        courses = await db.fetch(
            """
            SELECT c.id, c.course_title, c.course_description, 
                   c.total_modules, c.estimated_hours, c.is_completed,
                   c.created_at,
                   COUNT(DISTINCT cm.id) as modules_count,
                   COUNT(DISTINCT CASE WHEN cm.is_completed THEN cm.id END) as completed_modules
            FROM courses c
            LEFT JOIN user_profiles up ON c.user_profile_id = up.id
            LEFT JOIN course_modules cm ON c.id = cm.course_id
            WHERE up.user_id = $1
            GROUP BY c.id, c.course_title, c.course_description, 
                     c.total_modules, c.estimated_hours, c.is_completed, c.created_at
            ORDER BY c.created_at DESC
            """,
            user_id
        )
        
        result = []
        for course in courses:
            progress = 0
            if course['modules_count'] > 0:
                progress = round((course['completed_modules'] / course['modules_count']) * 100)
            
            result.append({
                "id": course['id'],
                "title": course['course_title'],
                "description": course['course_description'],
                "total_modules": course['total_modules'],
                "estimated_hours": float(course['estimated_hours']) if course['estimated_hours'] else 0,
                "is_completed": course['is_completed'],
                "progress_percentage": progress,
                "created_at": course['created_at'].isoformat() if course['created_at'] else None
            })
        
        return {"courses": result}
        
    except Exception as e:
        print(f"Error fetching courses: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching courses: {str(e)}"
        )


@router.get("/{course_id}")
async def get_course_details(
    course_id: int,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get detailed information about a specific course including all modules and lessons
    """
    try:
        user_id = current_user['userId']
        
        # Get course info and verify ownership
        course = await db.fetchrow(
            """
            SELECT c.id, c.course_title, c.course_description, 
                   c.total_modules, c.estimated_hours, c.is_completed,
                   c.created_at
            FROM courses c
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE c.id = $1 AND up.user_id = $2
            """,
            course_id,
            user_id
        )
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Get all modules with lessons
        modules = await db.fetch(
            """
            SELECT cm.id, cm.module_title, cm.module_order, 
                   cm.estimated_minutes, cm.is_completed,
                   t.tool_name, t.tool_category, t.description as tool_description
            FROM course_modules cm
            LEFT JOIN ai_tools t ON cm.tool_id = t.id
            WHERE cm.course_id = $1
            ORDER BY cm.module_order
            """,
            course_id
        )
        
        modules_data = []
        for module in modules:
            # Get lessons for this module
            lessons = await db.fetch(
                """
                SELECT id, lesson_type, lesson_title, lesson_order,
                       content_data, is_completed, completed_at
                FROM lessons
                WHERE module_id = $1
                ORDER BY lesson_order
                """,
                module['id']
            )
            
            lessons_data = []
            for lesson in lessons:
                lesson_dict = {
                    "id": lesson['id'],
                    "type": lesson['lesson_type'],
                    "title": lesson['lesson_title'],
                    "order": lesson['lesson_order'],
                    "is_completed": lesson['is_completed'],
                    "completed_at": lesson['completed_at'].isoformat() if lesson['completed_at'] else None
                }
                
                # Parse video data if available
                if lesson['content_data']:
                    try:
                        content = json.loads(lesson['content_data']) if isinstance(lesson['content_data'], str) else lesson['content_data']
                        lesson_dict['video_data'] = content
                    except:
                        pass
                
                lessons_data.append(lesson_dict)
            
            modules_data.append({
                "id": module['id'],
                "title": module['module_title'],
                "order": module['module_order'],
                "estimated_minutes": module['estimated_minutes'],
                "is_completed": module['is_completed'],
                "tool_name": module['tool_name'],
                "tool_category": module['tool_category'],
                "tool_description": module['tool_description'],
                "lessons": lessons_data,
                "total_lessons": len(lessons_data),
                "completed_lessons": sum(1 for l in lessons_data if l['is_completed'])
            })
        
        return {
            "course": {
                "id": course['id'],
                "title": course['course_title'],
                "description": course['course_description'],
                "total_modules": course['total_modules'],
                "estimated_hours": float(course['estimated_hours']) if course['estimated_hours'] else 0,
                "is_completed": course['is_completed'],
                "created_at": course['created_at'].isoformat() if course['created_at'] else None
            },
            "modules": modules_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching course details: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching course details: {str(e)}"
        )


@router.post("/{course_id}/modules/{module_id}/lessons/{lesson_id}/complete")
async def mark_lesson_complete(
    course_id: int,
    module_id: int,
    lesson_id: int,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Mark a lesson as completed
    """
    try:
        user_id = current_user['userId']
        
        # Verify ownership
        course = await db.fetchval(
            """
            SELECT c.id FROM courses c
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE c.id = $1 AND up.user_id = $2
            """,
            course_id,
            user_id
        )
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Mark lesson as completed
        await db.execute(
            """
            UPDATE lessons
            SET is_completed = true, completed_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND module_id = $2
            """,
            lesson_id,
            module_id
        )
        
        # Check if all lessons in module are completed
        all_completed = await db.fetchval(
            """
            SELECT COUNT(*) = COUNT(CASE WHEN is_completed THEN 1 END)
            FROM lessons
            WHERE module_id = $1
            """,
            module_id
        )
        
        if all_completed:
            # Mark module as completed
            await db.execute(
                """
                UPDATE course_modules
                SET is_completed = true
                WHERE id = $1
                """,
                module_id
            )
        
        # Check if all modules in course are completed
        all_modules_completed = await db.fetchval(
            """
            SELECT COUNT(*) = COUNT(CASE WHEN is_completed THEN 1 END)
            FROM course_modules
            WHERE course_id = $1
            """,
            course_id
        )
        
        if all_modules_completed:
            # Mark course as completed
            await db.execute(
                """
                UPDATE courses
                SET is_completed = true, completion_date = CURRENT_TIMESTAMP
                WHERE id = $1
                """,
                course_id
            )
        
        return {"success": True, "message": "Lesson marked as completed"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error marking lesson complete: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking lesson complete: {str(e)}"
        )
