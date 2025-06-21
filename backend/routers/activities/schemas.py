"""
Схеми для API активності бази даних
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models.db_activity import ActivityType

class DatabaseActivityOut(BaseModel):
    id: int
    activity_type: ActivityType
    entity_type: str
    entity_id: Optional[int]
    description: str
    details: Optional[str]
    performed_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True

class DatabaseActivityCreate(BaseModel):
    activity_type: ActivityType
    entity_type: str
    entity_id: Optional[int] = None
    description: str
    details: Optional[str] = None
    performed_by: Optional[str] = None 