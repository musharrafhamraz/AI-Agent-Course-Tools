from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Profile Creation
class ProfileCreate(BaseModel):
    sector_type: str = Field(..., pattern="^(Private|Government)$")
    organization_name: Optional[str] = None
    department_id: Optional[int] = None
    custom_department: Optional[str] = None
    job_title: str = Field(..., min_length=1)
    years_experience: int = Field(..., ge=0, le=50)
    current_tools: List[str] = []
    
    # Private sector fields
    industry: Optional[str] = None
    company_size: Optional[str] = None
    
    # Government sector fields
    province: Optional[str] = None

class ProfileResponse(BaseModel):
    user_profile_id: int
    message: str

# Job Tasks
class JobTask(BaseModel):
    category: str
    task_name: str
    task_description: str
    frequency: str
    complexity: str
    estimated_hours: float

class TasksGenerateRequest(BaseModel):
    user_profile_id: int

class TasksResponse(BaseModel):
    tasks: dict  # Grouped by category
    match_percentage: int
    total_tasks: int

class TaskConfirmRequest(BaseModel):
    user_profile_id: int
    selected_task_ids: List[int]
    custom_tasks: Optional[List[JobTask]] = []

class TaskConfirmResponse(BaseModel):
    confirmed_task_count: int
    message: str

# Learning Plan
class LearningModule(BaseModel):
    id: int
    module_title: str
    tool_name: str
    lessons: int
    estimated_minutes: int
    automates_what: str

class LearningPlanResponse(BaseModel):
    course: dict
    modules: List[dict]

class OnboardingCompleteRequest(BaseModel):
    user_profile_id: int

class OnboardingCompleteResponse(BaseModel):
    onboarding_completed: bool
    course_id: int
    redirect_to: str

# Tool Recommendation
class ToolRecommendation(BaseModel):
    id: int
    tool_name: str
    tool_category: str
    description: str
    automates_what: str
    difficulty_level: str
    is_free: bool
    pricing_info: Optional[str] = None
    official_url: Optional[str] = None
    relevance_score: Optional[float] = None

class ToolsRecommendResponse(BaseModel):
    recommended_tools: List[dict]
    all_tools: List[dict]
    total_recommended: int

class CustomToolAdd(BaseModel):
    tool_name: str
    description: str
    automates_what: str

class ToolsConfirmRequest(BaseModel):
    user_profile_id: int
    selected_tool_ids: List[int]
    custom_tools: Optional[List[CustomToolAdd]] = []

class ToolsConfirmResponse(BaseModel):
    confirmed_tool_count: int
    message: str
