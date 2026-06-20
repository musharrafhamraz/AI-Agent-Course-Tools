"""
Quiz Management Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.dependencies import get_current_user
from app.services.quiz_generator import quiz_generator
# pyrefly: ignore [missing-import]
import asyncpg
from typing import Dict, List
from pydantic import BaseModel
import json

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


class AnswerSubmission(BaseModel):
    question_id: int
    selected_answer: str


class QuizSubmission(BaseModel):
    answers: List[AnswerSubmission]


@router.post("/generate/lesson/{lesson_id}")
async def generate_quiz_for_lesson(
    lesson_id: int,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Generate quiz questions for a video lesson using YouTube transcript and Groq AI
    Only generates if quiz doesn't already exist
    """
    try:
        user_id = current_user['userId']
        
        # Get lesson details with module info
        lesson = await db.fetchrow(
            """
            SELECT l.id, l.lesson_title, l.content_data, l.module_id,
                   cm.module_title, cm.tool_id,
                   t.tool_name,
                   c.id as course_id
            FROM lessons l
            JOIN course_modules cm ON l.module_id = cm.id
            LEFT JOIN ai_tools t ON cm.tool_id = t.id
            JOIN courses c ON cm.course_id = c.id
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE l.id = $1 AND up.user_id = $2 AND l.lesson_type = 'video'
            """,
            lesson_id,
            user_id
        )
        
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found or access denied"
            )
        
        # Extract video data
        import json
        content_data = lesson['content_data']
        if isinstance(content_data, str):
            content_data = json.loads(content_data)
        
        video_id = content_data.get('video_id')
        video_url = content_data.get('watch_url', f"https://www.youtube.com/watch?v={video_id}")
        video_title = content_data.get('title', lesson['lesson_title'])
        
        if not video_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No video ID found for this lesson"
            )
        
        # Generate quiz
        result = await quiz_generator.generate_quiz_for_video(
            db=db,
            video_url=video_url,
            video_id_str=video_id,
            module_id=lesson['module_id'],
            tool_name=lesson['tool_name'] or 'AI Tool',
            video_title=video_title
        )
        
        if not result:
            # Transcript not available - this is OK, quiz is optional
            return {
                "success": False,
                "error": "transcript_unavailable",
                "message": "Transcript not available for this video. Quiz cannot be generated."
            }
        
        return {
            "success": True,
            "quiz_id": result['quiz_id'],
            "quiz_title": result['quiz_title'],
            "cached": result.get('cached', False),
            "question_count": result.get('question_count', 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating quiz: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating quiz: {str(e)}"
        )


@router.get("/lesson/{lesson_id}")
async def get_lesson_quiz(
    lesson_id: int,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get quiz for a specific lesson (video)
    """
    try:
        user_id = current_user['userId']
        
        # Verify user has access to this lesson
        lesson = await db.fetchrow(
            """
            SELECT l.id, l.module_id, l.content_data
            FROM lessons l
            JOIN course_modules cm ON l.module_id = cm.id
            JOIN courses c ON cm.course_id = c.id
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE l.id = $1 AND up.user_id = $2
            """,
            lesson_id,
            user_id
        )
        
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found or access denied"
            )
        
        # Get video_id from lesson content
        import json
        content_data = lesson['content_data']
        if isinstance(content_data, str):
            content_data = json.loads(content_data)
        
        video_id = content_data.get('video_id')
        
        if not video_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No video ID found for this lesson"
            )
        
        # Get quiz by video_id
        quiz = await db.fetchrow(
            """
            SELECT id, quiz_title, passing_score, created_at
            FROM quizzes
            WHERE module_id = $1 AND video_id = $2
            """,
            lesson['module_id'],
            video_id
        )
        
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not generated yet for this video"
            )
        
        # Get questions
        questions = await db.fetch(
            """
            SELECT id, question_text, question_type, 
                   options, correct_answer, question_order
            FROM quiz_questions
            WHERE quiz_id = $1
            ORDER BY question_order
            """,
            quiz['id']
        )
        
        # Get user's best attempt
        best_attempt = await db.fetchrow(
            """
            SELECT score, total_questions, passed, completed_at
            FROM quiz_attempts
            WHERE quiz_id = $1 AND user_id = $2
            ORDER BY score DESC, completed_at DESC
            LIMIT 1
            """,
            quiz['id'],
            user_id
        )
        
        questions_data = []
        for q in questions:
            options = q['options']
            if isinstance(options, str):
                try:
                    options = json.loads(options)
                except Exception as e:
                    print(f"Error parsing quiz question options: {e}")
            
            questions_data.append({
                "id": q['id'],
                "text": q['question_text'],
                "type": q['question_type'],
                "options": options,
                "order": q['question_order']
                # Don't send correct_answer to frontend
            })
        
        return {
            "quiz": {
                "id": quiz['id'],
                "title": quiz['quiz_title'],
                "passing_score": quiz['passing_score'],
                "total_questions": len(questions_data)
            },
            "questions": questions_data,
            "best_attempt": {
                "score": best_attempt['score'] if best_attempt else None,
                "total": best_attempt['total_questions'] if best_attempt else None,
                "passed": best_attempt['passed'] if best_attempt else None,
                "completed_at": best_attempt['completed_at'].isoformat() if best_attempt and best_attempt['completed_at'] else None
            } if best_attempt else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching quiz: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching quiz: {str(e)}"
        )


@router.post("/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: int,
    submission: QuizSubmission,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Submit quiz answers and get results
    """
    try:
        user_id = current_user['userId']
        
        # Get quiz info
        quiz = await db.fetchrow(
            """
            SELECT q.id, q.passing_score, q.module_id
            FROM quizzes q
            WHERE q.id = $1
            """,
            quiz_id
        )
        
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        
        # Get correct answers
        questions = await db.fetch(
            """
            SELECT id, correct_answer
            FROM quiz_questions
            WHERE quiz_id = $1
            """,
            quiz_id
        )
        
        # Calculate score
        correct_answers = {q['id']: q['correct_answer'] for q in questions}
        score = 0
        results = []
        
        for answer in submission.answers:
            is_correct = correct_answers.get(answer.question_id) == answer.selected_answer
            if is_correct:
                score += 1
            results.append({
                "question_id": answer.question_id,
                "selected_answer": answer.selected_answer,
                "correct_answer": correct_answers.get(answer.question_id),
                "is_correct": is_correct
            })
        
        total_questions = len(questions)
        percentage = round((score / total_questions) * 100) if total_questions > 0 else 0
        passed = percentage >= quiz['passing_score']
        
        # Save attempt
        await db.execute(
            """
            INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, passed, completed_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            """,
            user_id,
            quiz_id,
            percentage,
            total_questions,
            passed
        )
        
        # If passed, mark quiz lesson as complete
        if passed:
            await db.execute(
                """
                UPDATE lessons
                SET is_completed = true, completed_at = CURRENT_TIMESTAMP
                WHERE module_id = $1 AND lesson_type = 'quiz'
                """,
                quiz['module_id']
            )
        
        return {
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "passed": passed,
            "passing_score": quiz['passing_score'],
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting quiz: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting quiz: {str(e)}"
        )
