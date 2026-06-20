"""
Certificate Routes — Phase 7: Completion & Certification
Endpoints:
  POST /api/certificates/issue          — Issue a certificate for a completed course
  GET  /api/certificates/my-certificates — All certificates for the current user
  GET  /api/certificates/verify/:hash   — Public verification (no auth needed)
"""

import hashlib
import secrets
from datetime import datetime
from typing import Dict
# pyrefly: ignore [missing-import]
import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/certificates", tags=["Certificates"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class IssueRequest(BaseModel):
    course_id: int


# ── helpers ───────────────────────────────────────────────────────────────────

def _make_cert_number(user_id: int) -> str:
    """Generate a human-readable certificate number like SKB-2024-001234."""
    year = datetime.utcnow().year
    suffix = secrets.token_hex(3).upper()
    return f"SKB-{year}-{user_id:04d}{suffix}"


def _make_verification_hash(cert_number: str, user_id: int) -> str:
    """SHA-256 hash of cert number + user_id → 12-char short hash."""
    raw = f"{cert_number}:{user_id}:{secrets.token_hex(8)}"
    return hashlib.sha256(raw.encode()).hexdigest()[:24]


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.post("/issue")
async def issue_certificate(
    body: IssueRequest,
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Issue a certificate for a fully-completed course.
    Idempotent — returns the existing certificate if already issued.
    """
    user_id = current_user["userId"]
    course_id = body.course_id

    try:
        # ── 1. Verify the course belongs to this user and is completed ────────
        course = await db.fetchrow(
            """
            SELECT c.id, c.course_title, c.is_completed, c.completion_date
            FROM courses c
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE c.id = $1 AND up.user_id = $2
            """,
            course_id,
            user_id,
        )

        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        if not course["is_completed"]:
            raise HTTPException(
                status_code=400,
                detail="Course is not yet completed. Finish all modules before requesting a certificate.",
            )

        # ── 2. Return existing certificate if already issued ──────────────────
        existing = await db.fetchrow(
            "SELECT * FROM certificates WHERE user_id = $1 AND course_id = $2",
            user_id,
            course_id,
        )
        if existing:
            return _format_cert(existing, course["course_title"])

        # ── 3. Gather tools mastered from completed modules ───────────────────
        tools = await db.fetch(
            """
            SELECT DISTINCT t.tool_name
            FROM course_modules cm
            JOIN ai_tools t ON cm.tool_id = t.id
            WHERE cm.course_id = $1 AND cm.is_completed = TRUE
            ORDER BY t.tool_name
            """,
            course_id,
        )
        tools_mastered = [r["tool_name"] for r in tools]

        # ── 4. Create the certificate ─────────────────────────────────────────
        cert_number = _make_cert_number(user_id)
        verification_hash = _make_verification_hash(cert_number, user_id)

        cert = await db.fetchrow(
            """
            INSERT INTO certificates
              (user_id, course_id, certificate_number, verification_hash, tools_mastered)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            """,
            user_id,
            course_id,
            cert_number,
            verification_hash,
            tools_mastered,
        )

        return _format_cert(cert, course["course_title"])

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error issuing certificate: {str(e)}")


@router.get("/my-certificates")
async def get_my_certificates(
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """Return all certificates earned by the current user."""
    user_id = current_user["userId"]

    try:
        rows = await db.fetch(
            """
            SELECT cert.*, c.course_title,
                   (SELECT COUNT(*) FROM course_modules cm
                    WHERE cm.course_id = c.id AND cm.is_completed = TRUE) AS completed_modules,
                   c.total_modules
            FROM certificates cert
            JOIN courses c ON cert.course_id = c.id
            WHERE cert.user_id = $1
            ORDER BY cert.issue_date DESC
            """,
            user_id,
        )

        certs = [_format_cert(r, r["course_title"], full=True) for r in rows]

        # Also return the user's full name for the Certificate page header
        user_row = await db.fetchrow("SELECT full_name FROM users WHERE id = $1", user_id)
        full_name = user_row["full_name"] if user_row else ""

        return {"certificates": certs, "full_name": full_name}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching certificates: {str(e)}")


@router.get("/verify/{verification_hash}")
async def verify_certificate(
    verification_hash: str,
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Public endpoint — no authentication required.
    Verifies a certificate by its verification hash.
    """
    try:
        row = await db.fetchrow(
            """
            SELECT cert.certificate_number, cert.tools_mastered, cert.issue_date,
                   cert.is_verified, u.full_name, c.course_title
            FROM certificates cert
            JOIN users u ON cert.user_id = u.id
            JOIN courses c ON cert.course_id = c.id
            WHERE cert.verification_hash = $1
            """,
            verification_hash,
        )

        if not row:
            return {"valid": False, "certificate": None}

        return {
            "valid": row["is_verified"],
            "certificate": {
                "holder_name": row["full_name"],
                "course_title": row["course_title"],
                "certificate_number": row["certificate_number"],
                "tools_mastered": row["tools_mastered"] or [],
                "issue_date": row["issue_date"].strftime("%B %d, %Y") if row["issue_date"] else None,
            },
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Verification error: {str(e)}")


# ── Profile endpoint — also lives here for convenience ───────────────────────

@router.get("/profile-summary")
async def get_profile_summary(
    current_user: Dict = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Return aggregated profile data used by MyProfile page:
    - user info + onboarding profile
    - certificates count
    - completed courses count
    - current streak
    """
    user_id = current_user["userId"]

    try:
        user_row = await db.fetchrow(
            "SELECT id, email, full_name, created_at FROM users WHERE id = $1",
            user_id,
        )

        profile_row = await db.fetchrow(
            """
            SELECT up.sector_type, up.organization_name, up.job_title,
                   years_experience, current_tools, custom_department,
                   d.name AS department_name
            FROM user_profiles up
            LEFT JOIN departments d ON up.department_id = d.id
            WHERE up.user_id = $1
            """,
            user_id,
        )

        streak_row = await db.fetchrow(
            "SELECT current_streak, longest_streak, total_learning_days FROM user_streaks WHERE user_id = $1",
            user_id,
        )

        certs_count = await db.fetchval(
            "SELECT COUNT(*) FROM certificates WHERE user_id = $1", user_id
        )

        courses_completed = await db.fetchval(
            """
            SELECT COUNT(*) FROM courses c
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE up.user_id = $1 AND c.is_completed = TRUE
            """,
            user_id,
        )

        total_learning_minutes = await db.fetchval(
            """
            SELECT COALESCE(SUM(cm.estimated_minutes), 0)
            FROM course_modules cm
            JOIN courses c ON cm.course_id = c.id
            JOIN user_profiles up ON c.user_profile_id = up.id
            WHERE up.user_id = $1 AND cm.is_completed = TRUE
            """,
            user_id,
        )

        certs = await db.fetch(
            """
            SELECT cert.id, cert.certificate_number, cert.tools_mastered,
                   cert.issue_date, cert.verification_hash, c.course_title
            FROM certificates cert
            JOIN courses c ON cert.course_id = c.id
            WHERE cert.user_id = $1
            ORDER BY cert.issue_date DESC
            """,
            user_id,
        )

        return {
            "user": {
                "id": user_row["id"],
                "email": user_row["email"],
                "full_name": user_row["full_name"],
                "member_since": user_row["created_at"].strftime("%B %Y") if user_row["created_at"] else None,
            },
            "profile": {
                "sector_type": profile_row["sector_type"] if profile_row else None,
                "organization_name": profile_row["organization_name"] if profile_row else None,
                "job_title": profile_row["job_title"] if profile_row else None,
                "years_experience": profile_row["years_experience"] if profile_row else None,
                "current_tools": profile_row["current_tools"] if profile_row else [],
                "department_name": profile_row["department_name"] if profile_row else (
                    profile_row["custom_department"] if profile_row else None
                ),
            } if profile_row else None,
            "stats": {
                "courses_completed": courses_completed or 0,
                "certificates_earned": certs_count or 0,
                "current_streak": streak_row["current_streak"] if streak_row else 0,
                "longest_streak": streak_row["longest_streak"] if streak_row else 0,
                "total_learning_days": streak_row["total_learning_days"] if streak_row else 0,
                "total_learning_hours": round((total_learning_minutes or 0) / 60, 1),
            },
            "certificates": [_format_cert(r, r["course_title"]) for r in certs],
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")


# ── private helper ────────────────────────────────────────────────────────────

def _format_cert(row, course_title: str, full: bool = False) -> dict:
    issue_date = row["issue_date"]
    return {
        "id": row["id"],
        "certificate_number": row["certificate_number"],
        "verification_hash": row["verification_hash"],
        "course_title": course_title,
        "tools_mastered": row["tools_mastered"] or [],
        "issue_date_display": issue_date.strftime("%B %d, %Y") if issue_date else None,
        "issue_date_short": issue_date.strftime("%b %Y") if issue_date else None,
        "verification_url": f"/verify/{row['verification_hash']}",
        **({"is_verified": row.get("is_verified", True)} if full else {}),
    }
