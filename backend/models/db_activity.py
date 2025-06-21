"""
Модель для відстеження активності в базі даних
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
from datetime import datetime
import enum
from database_base import Base

class ActivityType(enum.Enum):
    LANTERN_CREATED = "lantern_created"
    LANTERN_UPDATED = "lantern_updated"
    LANTERN_DELETED = "lantern_deleted"
    PARK_CREATED = "park_created"
    PARK_UPDATED = "park_updated"
    PARK_DELETED = "park_deleted"
    BREAKDOWN_CREATED = "breakdown_created"
    BREAKDOWN_UPDATED = "breakdown_updated"
    BREAKDOWN_FIXED = "breakdown_fixed"
    RENOVATION_CREATED = "renovation_created"
    RENOVATION_UPDATED = "renovation_updated"
    RENOVATION_COMPLETED = "renovation_completed"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    SYSTEM_UPDATE = "system_update"
    DATA_EXPORT = "data_export"
    BACKUP_CREATED = "backup_created"

class DatabaseActivity(Base):
    __tablename__ = "database_activities"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(Enum(ActivityType), nullable=False)
    entity_type = Column(String(50), nullable=False)  # 'lantern', 'park', 'breakdown', etc.
    entity_id = Column(Integer, nullable=True)  # ID of the affected entity
    description = Column(Text, nullable=False)
    details = Column(Text, nullable=True)  # JSON with additional details
    performed_by = Column(String(100), nullable=True)  # User who performed the action
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False) 