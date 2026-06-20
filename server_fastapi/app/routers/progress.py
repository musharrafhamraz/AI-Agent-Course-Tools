"""
Progress Tracking Routes
Endpoint: GET /api/progress/tracker
Returns skill proficiency, weekly hours, streak, xp, module log, and certificates
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.dependencies import get_current_user
# pyrefly: ignore [missing-import]
import asyncpg
from typing import Dict
from datetime import datetime, timedelta, date

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/tracker")
async def get_progress_tracker(
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Detailed progress analytics for the ProgressTracker page.
    Returns:
      - skill_proficiency: skill name → score (%)
      - weekly_hours: Mon–Sun + total
      - streak: current + longest
      - xp: total xp points
      - completed_modules / total_modules
      - module_log: per-module detail rows
      - certificates: issued certificates
    """
    try:
        user_id = current_user['userId']

        # ─────────────────────────────────────────────
        # 1. Fetch user's courses + modules + lessons
        # ─────────────────────────────────────────────
        courses = await db.fetch(
            """
            SELECT c.id, c.course_title, c.total_modules, c.estimated_hours, c.is_completed
            FROM courses c
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE up.user_id = $1
            ORDER BY c.created_at DESC
            """,
            user_id
        )

        total_modules = 0
        completed_modules = 0
        total_lessons = 0
        completed_lessons = 0
        module_log = []
        total_estimated_minutes = 0

        for course in courses:
            modules = await db.fetch(
                """
                SELECT cm.id, cm.module_title, cm.module_order,
                       cm.estimated_minutes, cm.is_completed,
                       t.tool_name, t.tool_category
                FROM course_modules cm
                LEFT JOIN ai_tools t ON cm.tool_id = t.id
                WHERE cm.course_id = $1
                ORDER BY cm.module_order
                """,
                course['id']
            )

            for module in modules:
                total_modules += 1
                if module['is_completed']:
                    completed_modules += 1

                est_mins = module['estimated_minutes'] or 0
                total_estimated_minutes += est_mins

                # Count lessons for this module
                lesson_stats = await db.fetchrow(
                    """
                    SELECT
                        COUNT(*) AS total,
                        COUNT(CASE WHEN is_completed THEN 1 END) AS completed
                    FROM lessons
                    WHERE module_id = $1
                    """,
                    module['id']
                )

                mod_total_lessons = lesson_stats['total'] or 0
                mod_completed_lessons = lesson_stats['completed'] or 0
                total_lessons += mod_total_lessons
                completed_lessons += mod_completed_lessons

                # Best quiz score for this module (if any)
                best_quiz_score = await db.fetchval(
                    """
                    SELECT MAX(qa.score)
                    FROM quiz_attempts qa
                    JOIN quizzes q ON qa.quiz_id = q.id
                    WHERE q.module_id = $1 AND qa.user_id = $2
                    """,
                    module['id'],
                    user_id
                )

                # Determine status
                if module['is_completed']:
                    mod_status = "completed"
                elif mod_completed_lessons > 0:
                    mod_status = "in_progress"
                else:
                    mod_status = "not_started"

                # Format estimated time
                h = est_mins // 60
                m = est_mins % 60
                time_display = f"{h}h {m}m" if h > 0 else f"{m}m"

                module_log.append({
                    "module_id": module['id'],
                    "course_title": course['course_title'],
                    "module_title": module['module_title'],
                    "module_order": module['module_order'],
                    "time_invested": time_display,
                    "tool_name": module['tool_name'],
                    "tool_category": module['tool_category'],
                    "score": best_quiz_score,
                    "status": mod_status,
                    "completed_lessons": mod_completed_lessons,
                    "total_lessons": mod_total_lessons,
                })

        # ─────────────────────────────────────────────
        # 2. Streak data
        # ─────────────────────────────────────────────
        streak_row = await db.fetchrow(
            """
            SELECT current_streak, longest_streak, last_activity_date, total_learning_days
            FROM user_streaks
            WHERE user_id = $1
            """,
            user_id
        )

        current_streak = 0
        longest_streak = 0
        total_learning_days = 0
        if streak_row:
            current_streak = streak_row['current_streak'] or 0
            longest_streak = streak_row['longest_streak'] or 0
            total_learning_days = streak_row['total_learning_days'] or 0

        # ─────────────────────────────────────────────
        # 3. XP calculation
        #    - 50 XP per completed lesson
        #    - 100 XP per completed module
        #    - bonus: quiz score contribution
        # ─────────────────────────────────────────────
        xp = (completed_lessons * 50) + (completed_modules * 100)

        # Add quiz XP (1 XP per percentage point scored)
        quiz_xp_rows = await db.fetch(
            """
            SELECT qa.score
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN course_modules cm ON q.module_id = cm.id
            JOIN courses c ON cm.course_id = c.id
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE up.user_id = $1
            """,
            user_id
        )
        for row in quiz_xp_rows:
            xp += row['score'] or 0

        # ─────────────────────────────────────────────
        # 4. Weekly hours (approximated from estimated_minutes of completed modules
        #    grouped by completion day-of-week, or fallback to even distribution)
        # ─────────────────────────────────────────────
        # Get lessons completed this week with their completed_at timestamps
        today = date.today()
        week_start = today - timedelta(days=today.weekday())  # Monday

        weekly_lessons = await db.fetch(
            """
            SELECT l.completed_at, l.module_id
            FROM lessons l
            JOIN course_modules cm ON l.module_id = cm.id
            JOIN courses c ON cm.course_id = c.id
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE up.user_id = $1
              AND l.is_completed = TRUE
              AND l.completed_at >= $2
            """,
            user_id,
            week_start
        )

        # Average lesson duration: use total_estimated_minutes / total_lessons if available
        avg_lesson_minutes = 0
        if total_lessons > 0 and total_estimated_minutes > 0:
            avg_lesson_minutes = total_estimated_minutes / total_lessons

        days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        weekly_map = {d: 0.0 for d in days}

        for lesson in weekly_lessons:
            if lesson['completed_at']:
                dow = lesson['completed_at'].weekday()  # 0=Mon ... 6=Sun
                weekly_map[days[dow]] += round(avg_lesson_minutes / 60, 2)

        weekly_total = round(sum(weekly_map.values()), 1)

        # ─────────────────────────────────────────────
        # 5. Skill proficiency (based on tool categories mastered)
        # ─────────────────────────────────────────────
        # Map tool_category → skill name, compute % from completed / total modules per category
        skill_category_map = {
            'productivity':   'Prompt Engineering',
            'writing':        'AI-Assisted Writing',
            'creative':       'Automation',
            'data':           'Data Science',
            'utility':        'NLP Fundamentals',
            'analytics':      'Data Science',
            'communication':  'NLP Fundamentals',
            'marketing':      'AI-Assisted Writing',
        }

        skill_completed = {}
        skill_total = {}

        for entry in module_log:
            cat = (entry.get('tool_category') or '').lower()
            skill = skill_category_map.get(cat, 'Prompt Engineering')
            skill_total[skill] = skill_total.get(skill, 0) + 1
            if entry['status'] == 'completed':
                skill_completed[skill] = skill_completed.get(skill, 0) + 1

        # Default skills always present
        default_skills = ['Prompt Engineering', 'AI Ethics', 'Automation', 'Data Science', 'NLP Fundamentals']
        skill_proficiency = {}
        for sk in default_skills:
            tot = skill_total.get(sk, 0)
            comp = skill_completed.get(sk, 0)
            if tot > 0:
                skill_proficiency[sk] = round((comp / tot) * 100)
            else:
                skill_proficiency[sk] = 0

        # Boost slightly if user has any progress at all (encouragement floor)
        overall_progress = round((completed_modules / total_modules) * 100) if total_modules > 0 else 0
        if overall_progress > 0:
            for sk in skill_proficiency:
                # Floor: at least 10% if the user has any progress
                if skill_proficiency[sk] == 0:
                    skill_proficiency[sk] = max(10, overall_progress // 2)

        # ─────────────────────────────────────────────
        # 6. Certificates
        # ─────────────────────────────────────────────
        certs = await db.fetch(
             """
            SELECT cert.id, cert.certificate_number, cert.tools_mastered,
                   cert.issue_date, cert.verification_hash,
                   c.course_title
            FROM certificates cert
            JOIN courses c ON cert.course_id = c.id
            WHERE cert.user_id = $1
            ORDER BY cert.issue_date DESC
            """,
            user_id
        )

        certificates = []
        for cert in certs:
            certificates.append({
                "id": cert['id'],
                "certificate_number": cert['certificate_number'],
                "course_title": cert['course_title'],
                "tools_mastered": cert['tools_mastered'] or [],
                "issue_date": cert['issue_date'].strftime("%b %Y") if cert['issue_date'] else None,
                "verification_hash": cert['verification_hash'],
            })

        # ─────────────────────────────────────────────
        # 7. Current focus course info
        # ─────────────────────────────────────────────
        current_course_info = None
        if courses:
            first = courses[0]
            # Find next uncompleted lesson
            next_lesson_title = None
            top_modules = await db.fetch(
                """
                SELECT cm.id, cm.module_title FROM course_modules cm
                WHERE cm.course_id = $1 AND cm.is_completed = FALSE
                ORDER BY cm.module_order LIMIT 1
                """,
                first['id']
            )
            if top_modules:
                next_l = await db.fetchrow(
                    """
                    SELECT lesson_title FROM lessons
                    WHERE module_id = $1 AND is_completed = FALSE
                    ORDER BY lesson_order LIMIT 1
                    """,
                    top_modules[0]['id']
                )
                if next_l:
                    next_lesson_title = next_l['lesson_title']

            current_course_info = {
                "id": first['id'],
                "title": first['course_title'],
                "progress_percentage": overall_progress,
                "next_lesson": next_lesson_title,
            }

        return {
            "skill_proficiency": skill_proficiency,
            "weekly_hours": {**weekly_map, "total": weekly_total},
            "streak": {
                "current": current_streak,
                "longest": longest_streak,
                "total_learning_days": total_learning_days,
            },
            "xp": xp,
            "completed_modules": completed_modules,
            "total_modules": total_modules,
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "overall_progress": overall_progress,
            "module_log": module_log,
            "certificates": certificates,
            "current_course": current_course_info,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching progress data: {str(e)}"
        )
