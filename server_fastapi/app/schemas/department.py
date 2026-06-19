from pydantic import BaseModel
from datetime import datetime

class DepartmentResponse(BaseModel):
    id: int
    name: str
    sector_type: str
    description: str
    created_at: datetime
