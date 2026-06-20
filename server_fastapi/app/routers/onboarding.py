from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.database import get_db
from app.schemas.onboarding import (
    ProfileCreate, ProfileResponse,
    TasksGenerateRequest, TasksResponse,
    TaskConfirmRequest, TaskConfirmResponse,
    LearningPlanResponse,
    OnboardingCompleteRequest, OnboardingCompleteResponse,
    JobTask,
    ToolsRecommendResponse, ToolsConfirmRequest, ToolsConfirmResponse, CustomToolAdd
)
from app.services import ai_service
from app.dependencies import get_current_user
from app.limiter import limiter
# pyrefly: ignore [missing-import]
import asyncpg
import json
from typing import Dict

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

@router.post("/profile", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile: ProfileCreate,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Create user profile from onboarding data
    """
    try:
        user_id = current_user['userId']
        
        # Check if profile already exists
        profile_id = await db.fetchval(
            "SELECT id FROM user_profiles WHERE user_id = $1",
            user_id
        )
        
        if profile_id:
            # Update user profile and reset completion status
            query = """
                UPDATE user_profiles 
                SET sector_type = $2, organization_name = $3, department_id = $4, 
                    custom_department = $5, job_title = $6, years_experience = $7, 
                    current_tools = $8, onboarding_completed = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            """
            await db.execute(
                query,
                profile_id,
                profile.sector_type,
                profile.organization_name,
                profile.department_id,
                profile.custom_department,
                profile.job_title,
                profile.years_experience,
                profile.current_tools
            )
            
            # Clear stale tasks and courses from previous onboarding state
            await db.execute("DELETE FROM job_tasks WHERE user_profile_id = $1", profile_id)
            await db.execute("DELETE FROM courses WHERE user_profile_id = $1", profile_id)
            
            return ProfileResponse(
                user_profile_id=profile_id,
                message="Profile updated successfully"
            )
        
        # Insert user profile
        query = """
            INSERT INTO user_profiles 
            (user_id, sector_type, organization_name, department_id, 
             custom_department, job_title, years_experience, current_tools, 
             onboarding_completed)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
            RETURNING id
        """
        
        profile_id = await db.fetchval(
            query,
            user_id,
            profile.sector_type,
            profile.organization_name,
            profile.department_id,
            profile.custom_department,
            profile.job_title,
            profile.years_experience,
            profile.current_tools
        )
        
        return ProfileResponse(
            user_profile_id=profile_id,
            message="Profile created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating profile: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating profile: {str(e)}"
        )


@router.post("/tasks/generate", response_model=TasksResponse)
@limiter.limit("5/minute")
async def generate_tasks(
    request: Request,
    body: TasksGenerateRequest,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Generate AI-powered job tasks based on user profile
    """
    try:
        user_id = current_user['userId']
        
        # Get user profile
        profile = await db.fetchrow(
            """
            SELECT up.*, d.name as department_name
            FROM user_profiles up
            LEFT JOIN departments d ON up.department_id = d.id
            WHERE up.id = $1 AND up.user_id = $2
            """,
            body.user_profile_id,
            user_id
        )
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Generate tasks using AI service
        department_name = profile['department_name'] or profile['custom_department'] or "General"
        
        result = await ai_service.generate_job_tasks(
            job_title=profile['job_title'],
            sector_type=profile['sector_type'],
            department=department_name,
            years_experience=profile['years_experience'],
            tools=profile['current_tools'] or []
        )
        
        # Store generated tasks in database
        for category, tasks in result['tasks'].items():
            for task in tasks:
                await db.execute(
                    """
                    INSERT INTO job_tasks 
                    (user_profile_id, category, task_name, task_description, 
                     frequency, complexity, is_approved, is_custom)
                    VALUES ($1, $2, $3, $4, $5, $6, false, false)
                    """,
                    body.user_profile_id,
                    category,
                    task['task_name'],
                    task['task_description'],
                    task['frequency'],
                    task['complexity']
                )
        
        # Fetch stored tasks with IDs
        stored_tasks = await db.fetch(
            """
            SELECT id, category, task_name, task_description, frequency, complexity
            FROM job_tasks
            WHERE user_profile_id = $1
            ORDER BY category, id
            """,
            body.user_profile_id
        )
        
        # Group tasks by category with IDs
        grouped = {}
        for task in stored_tasks:
            category = task['category']
            if category not in grouped:
                grouped[category] = []
            
            grouped[category].append({
                "id": task['id'],
                "task_name": task['task_name'],
                "task_description": task['task_description'],
                "frequency": task['frequency'],
                "complexity": task['complexity'],
                "estimated_hours": 4  # Default estimate
            })
        
        return TasksResponse(
            tasks=grouped,
            match_percentage=result['match_percentage'],
            total_tasks=result['total_tasks']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating tasks: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating tasks: {str(e)}"
        )


@router.post("/tasks/confirm", response_model=TaskConfirmResponse)
async def confirm_tasks(
    request: TaskConfirmRequest,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Confirm selected tasks and add custom tasks
    """
    try:
        user_id = current_user['userId']
        
        # Verify profile ownership
        profile = await db.fetchval(
            "SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2",
            request.user_profile_id,
            user_id
        )
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Mark selected tasks as approved
        if request.selected_task_ids:
            await db.execute(
                """
                UPDATE job_tasks 
                SET is_approved = true
                WHERE id = ANY($1::int[]) AND user_profile_id = $2
                """,
                request.selected_task_ids,
                request.user_profile_id
            )
        
        # Add custom tasks
        custom_count = 0
        if request.custom_tasks:
            for task in request.custom_tasks:
                await db.execute(
                    """
                    INSERT INTO job_tasks 
                    (user_profile_id, category, task_name, task_description, 
                     frequency, complexity, is_approved, is_custom)
                    VALUES ($1, $2, $3, $4, $5, $6, true, true)
                    """,
                    request.user_profile_id,
                    task.category,
                    task.task_name,
                    task.task_description,
                    task.frequency,
                    task.complexity
                )
                custom_count += 1
        
        total_confirmed = len(request.selected_task_ids) + custom_count
        
        return TaskConfirmResponse(
            confirmed_task_count=total_confirmed,
            message=f"Successfully confirmed {total_confirmed} tasks"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error confirming tasks: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error confirming tasks: {str(e)}"
        )


@router.post("/tools/recommend", response_model=ToolsRecommendResponse)
async def recommend_tools(
    request: TasksGenerateRequest,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Recommend AI tools based on confirmed tasks using intelligent matching
    """
    try:
        from app.services.tool_matcher import ToolMatcher
        
        user_id = current_user['userId']
        
        # Verify profile
        profile = await db.fetchval(
            "SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2",
            request.user_profile_id,
            user_id
        )
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Get approved tasks
        approved_tasks = await db.fetch(
            """
            SELECT id, category, task_name, task_description, frequency, complexity
            FROM job_tasks
            WHERE user_profile_id = $1 AND is_approved = true
            ORDER BY category, id
            """,
            request.user_profile_id
        )
        
        if not approved_tasks or len(approved_tasks) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No tasks confirmed. Please complete the task selection step first."
            )
        
        # Convert to dict list
        tasks_list = [dict(task) for task in approved_tasks]
        
        # Initialize tool matcher
        matcher = ToolMatcher(db)
        
        # Match tools to tasks (get top 5-7 recommendations)
        matched_tools = await matcher.match_tools_to_tasks(
            tasks=tasks_list,
            max_tools=7
        )
        
        # Get all available tools for browsing
        all_tools = await db.fetch(
            """
            SELECT id, tool_name, tool_category, description, 
                   official_url, difficulty_level, is_free, pricing_info
            FROM ai_tools
            ORDER BY tool_category, tool_name
            """
        )
        
        # Format recommended tools
        recommended = []
        for item in matched_tools:
            tool = item["tool"]
            recommended.append({
                "id": tool["id"],
                "tool_name": tool["tool_name"],
                "tool_category": tool["tool_category"],
                "description": tool["description"],
                "automates_what": item.get("relevance_reason", "task automation"),
                "difficulty_level": tool.get("difficulty_level", "beginner"),
                "is_free": tool.get("is_free", False),
                "pricing_info": tool.get("pricing_info"),
                "official_url": tool.get("official_url"),
                "relevance_score": item.get("score", 0),
                "is_custom": False
            })
        
        # Format all tools
        all_tools_formatted = []
        for tool in all_tools:
            all_tools_formatted.append({
                "id": tool["id"],
                "tool_name": tool["tool_name"],
                "tool_category": tool["tool_category"],
                "description": tool["description"],
                "difficulty_level": tool.get("difficulty_level", "beginner"),
                "is_free": tool.get("is_free", False),
                "pricing_info": tool.get("pricing_info"),
                "official_url": tool.get("official_url")
            })
        
        return ToolsRecommendResponse(
            recommended_tools=recommended,
            all_tools=all_tools_formatted,
            total_recommended=len(recommended)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error recommending tools: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error recommending tools: {str(e)}"
        )


@router.post("/tools/confirm", response_model=ToolsConfirmResponse)
async def confirm_tools(
    request: ToolsConfirmRequest,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Confirm selected AI tools for learning plan generation
    """
    try:
        user_id = current_user['userId']
        
        # Verify profile ownership
        profile = await db.fetchval(
            "SELECT id FROM user_profiles WHERE id = $1 AND user_id = $2",
            request.user_profile_id,
            user_id
        )
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Create a temporary table to store selected tools for this user
        # First, clear any existing selections
        await db.execute(
            """
            DELETE FROM user_selected_tools WHERE user_profile_id = $1
            """,
            request.user_profile_id
        )
        
        # Insert selected tools from database
        if request.selected_tool_ids:
            for tool_id in request.selected_tool_ids:
                await db.execute(
                    """
                    INSERT INTO user_selected_tools (user_profile_id, tool_id, is_custom)
                    VALUES ($1, $2, false)
                    """,
                    request.user_profile_id,
                    tool_id
                )
        
        # Insert custom tools
        custom_count = 0
        if request.custom_tools:
            for custom_tool in request.custom_tools:
                # Insert custom tool into ai_tools first
                tool_id = await db.fetchval(
                    """
                    INSERT INTO ai_tools 
                    (tool_name, tool_category, description, difficulty_level, is_free)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                    """,
                    custom_tool.tool_name,
                    'custom',
                    f"{custom_tool.description}. Automates: {custom_tool.automates_what}",
                    'beginner',
                    True
                )
                
                # Link to user
                await db.execute(
                    """
                    INSERT INTO user_selected_tools (user_profile_id, tool_id, is_custom)
                    VALUES ($1, $2, true)
                    """,
                    request.user_profile_id,
                    tool_id
                )
                custom_count += 1
        
        total_confirmed = len(request.selected_tool_ids) + custom_count
        
        return ToolsConfirmResponse(
            confirmed_tool_count=total_confirmed,
            message=f"Successfully confirmed {total_confirmed} tools for your learning plan"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error confirming tools: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error confirming tools: {str(e)}"
        )


@router.post("/learning-plan/generate", response_model=LearningPlanResponse)
async def generate_learning_plan(
    request: TasksGenerateRequest,  # Reusing same request schema
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Generate personalized learning plan with YouTube videos based on confirmed tools
    """
    try:
        from app.services.youtube_service import YouTubeService, generate_course_from_tools
        from app.config import settings
        
        user_id = current_user['userId']
        
        # Verify profile
        profile = await db.fetchrow(
            "SELECT * FROM user_profiles WHERE id = $1 AND user_id = $2",
            request.user_profile_id,
            user_id
        )
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Get selected tools with details
        selected_tools = await db.fetch(
            """
            SELECT t.id, t.tool_name, t.tool_category, t.description,
                   t.difficulty_level, t.is_free, t.pricing_info
            FROM user_selected_tools ust
            JOIN ai_tools t ON ust.tool_id = t.id
            WHERE ust.user_profile_id = $1
            ORDER BY ust.created_at
            """,
            request.user_profile_id
        )
        
        if not selected_tools or len(selected_tools) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No tools selected. Please complete the tool selection step first."
            )
        
        # Convert to dict list
        tools_list = [dict(tool) for tool in selected_tools]
        
        # Get approved tasks for context
        approved_tasks = await db.fetch(
            """
            SELECT category, task_name, task_description
            FROM job_tasks
            WHERE user_profile_id = $1 AND is_approved = true
            LIMIT 3
            """,
            request.user_profile_id
        )
        
        # Generate course with YouTube videos
        youtube_api_key = getattr(settings, 'YOUTUBE_API_KEY', None)
        course_structure = await generate_course_from_tools(
            db=db,
            tools=tools_list,
            profile=dict(profile),
            youtube_api_key=youtube_api_key
        )
        
        # Calculate total time
        total_minutes = course_structure['total_duration_minutes']
        estimated_hours = round(total_minutes / 60, 1)
        
        # Create course
        course_title = f"AI Tools Mastery for {profile['job_title']}"
        course_description = (
            f"Personalized learning path designed for {profile['job_title']} professionals "
            f"in the {profile['sector_type']} sector. Master {len(tools_list)} AI tools "
            f"through {course_structure['total_videos']} curated video tutorials."
        )
        
        course_id = await db.fetchval(
            """
            INSERT INTO courses 
            (user_profile_id, course_title, course_description, total_modules, estimated_hours)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            """,
            request.user_profile_id,
            course_title,
            course_description,
            len(course_structure['modules']),
            estimated_hours
        )
        
        # Create modules and lessons with YouTube videos
        modules_response = []
        for module_data in course_structure['modules']:
            # Generate automation context from tasks
            automates_what = "task automation and workflow optimization"
            if approved_tasks:
                task_names = [t['task_name'] for t in approved_tasks[:2]]
                automates_what = f"{', '.join(task_names)}"
            
            # Insert module
            module_id = await db.fetchval(
                """
                INSERT INTO course_modules 
                (course_id, tool_id, module_title, module_order, estimated_minutes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
                """,
                course_id,
                module_data['tool_id'],
                module_data['module_title'],
                module_data['module_order'],
                module_data['estimated_minutes']
            )
            
            # Create lessons with video data
            for lesson_data in module_data['lessons']:
                lesson_type = lesson_data['lesson_type']
                
                if lesson_type == 'video' and 'video_data' in lesson_data:
                    video = lesson_data['video_data']
                    
                    # Store video content data
                    content_data = {
                        'video_id': video['video_id'],
                        'title': video['title'],
                        'embed_url': video['embed_url'],
                        'watch_url': video['watch_url'],
                        'duration': video['duration_seconds'],
                        'channel_name': video['channel_name'],
                        'thumbnail_url': video.get('thumbnail_url', ''),
                        'view_count': video.get('view_count', 0),
                        'is_mock': video.get('is_mock', False)
                    }
                    
                    lesson_id = await db.fetchval(
                        """
                        INSERT INTO lessons 
                        (module_id, lesson_type, lesson_title, lesson_order, content_data)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING id
                        """,
                        module_id,
                        lesson_type,
                        lesson_data['lesson_title'],
                        lesson_data['lesson_order'],
                        json.dumps(content_data)
                    )
                    
                    # Also store in youtube_videos table for tracking
                    await db.execute(
                        """
                        INSERT INTO youtube_videos 
                        (lesson_id, video_id, video_title, channel_name, view_count, duration, video_order)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT DO NOTHING
                        """,
                        lesson_id,
                        video['video_id'],
                        video['title'],
                        video['channel_name'],
                        video.get('view_count', 0),
                        video['duration_seconds'],
                        lesson_data['lesson_order']
                    )
                else:
                    # Quiz lesson
                    await db.execute(
                        """
                        INSERT INTO lessons 
                        (module_id, lesson_type, lesson_title, lesson_order, content_data)
                        VALUES ($1, $2, $3, $4, $5)
                        """,
                        module_id,
                        lesson_type,
                        lesson_data['lesson_title'],
                        lesson_data['lesson_order'],
                        None
                    )
            
            # Prepare module response
            modules_response.append({
                "id": module_id,
                "module_title": module_data['module_title'],
                "tool_name": module_data['tool_name'],
                "lessons": module_data['total_lessons'],
                "video_count": module_data['video_count'],
                "estimated_minutes": module_data['estimated_minutes'],
                "automates_what": automates_what
            })
        
        return LearningPlanResponse(
            course={
                "id": course_id,
                "title": course_title,
                "description": course_description,
                "total_modules": len(course_structure['modules']),
                "estimated_hours": estimated_hours,
                "total_videos": course_structure['total_videos']
            },
            modules=modules_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating learning plan: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating learning plan: {str(e)}"
        )


@router.post("/complete", response_model=OnboardingCompleteResponse)
async def complete_onboarding(
    request: OnboardingCompleteRequest,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Mark onboarding as complete
    """
    try:
        user_id = current_user['userId']
        
        # Update profile
        await db.execute(
            """
            UPDATE user_profiles 
            SET onboarding_completed = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            """,
            request.user_profile_id,
            user_id
        )
        
        # Get the course ID for this profile
        course_id = await db.fetchval(
            "SELECT id FROM courses WHERE user_profile_id = $1 ORDER BY id DESC LIMIT 1",
            request.user_profile_id
        )
        
        if not course_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No course found for this profile"
            )
        
        return OnboardingCompleteResponse(
            onboarding_completed=True,
            course_id=course_id,
            redirect_to="/dashboard"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error completing onboarding: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing onboarding: {str(e)}"
        )
