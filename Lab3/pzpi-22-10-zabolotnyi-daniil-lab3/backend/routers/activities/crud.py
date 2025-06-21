"""
CRUD операції для активності бази даних
"""
from sqlalchemy.orm import Session
from models.db_activity import DatabaseActivity, ActivityType
from .schemas import DatabaseActivityCreate
from typing import List
import json

def create_activity(db: Session, activity_data: DatabaseActivityCreate) -> DatabaseActivity:
    """Створити новий запис активності"""
    db_activity = DatabaseActivity(**activity_data.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def get_activities(db: Session, skip: int = 0, limit: int = 20) -> List[DatabaseActivity]:
    """Отримати список активностей"""
    return db.query(DatabaseActivity).order_by(DatabaseActivity.created_at.desc()).offset(skip).limit(limit).all()

def get_recent_activities(db: Session, limit: int = 10) -> List[DatabaseActivity]:
    """Отримати останні активності"""
    return db.query(DatabaseActivity).order_by(DatabaseActivity.created_at.desc()).limit(limit).all()

def log_activity(
    db: Session,
    activity_type: ActivityType,
    entity_type: str,
    description: str,
    entity_id: int = None,
    details: dict = None,
    performed_by: str = None
):
    """Швидкий спосіб логування активності"""
    activity_data = DatabaseActivityCreate(
        activity_type=activity_type,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
        details=json.dumps(details) if details else None,
        performed_by=performed_by
    )
    return create_activity(db, activity_data) 