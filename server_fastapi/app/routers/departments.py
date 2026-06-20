from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.database import get_db
from app.schemas.department import DepartmentResponse
from typing import List, Optional
# pyrefly: ignore [missing-import]
import asyncpg

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=List[DepartmentResponse])
async def get_departments(
    sector_type: Optional[str] = Query(None, pattern="^(Private|Government)$"),
    search: Optional[str] = None,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get all departments (optionally filter by sector_type and search)
    """
    try:
        query = "SELECT * FROM departments WHERE 1=1"
        params = []
        param_count = 1

        if sector_type:
            query += f" AND (sector_type = ${param_count} OR sector_type = 'Both')"
            params.append(sector_type)
            param_count += 1

        if search:
            query += f" AND name ILIKE ${param_count}"
            params.append(f"%{search}%")
            param_count += 1

        query += " ORDER BY sector_type, name"

        departments = await db.fetch(query, *params)
        return [DepartmentResponse(**dict(dept)) for dept in departments]
    except Exception as e:
        print(f"Error fetching departments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error"
        )

@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department_by_id(
    department_id: int,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get department by ID
    """
    try:
        query = "SELECT * FROM departments WHERE id = $1"
        department = await db.fetchrow(query, department_id)

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )

        return DepartmentResponse(**dict(department))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching department: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error"
        )
