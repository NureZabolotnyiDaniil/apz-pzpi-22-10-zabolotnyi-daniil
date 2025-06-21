"""
API для активності бази даних
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from routers.admin.dependencies import get_current_admin
from models.admins import Admin
from .schemas import DatabaseActivityOut
from .crud import get_activities, get_recent_activities

router = APIRouter(prefix="/activities", tags=["Database Activities"])

@router.get("/", response_model=List[DatabaseActivityOut])
def list_activities(
    skip: int = Query(0, ge=0, description="Number of activities to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of activities to return"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Отримати список активностей бази даних"""
    activities = get_activities(db, skip=skip, limit=limit)
    return activities

@router.get("/recent", response_model=List[DatabaseActivityOut])
def list_recent_activities(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of recent activities to return"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Отримати останні активності для Dashboard"""
    activities = get_recent_activities(db, limit=limit)
    return activities 

# Тестовий endpoint без авторизації
@router.get("/recent-test")
def list_recent_activities_test(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of recent activities to return"),
    db: Session = Depends(get_db),
):
    """Тестовий endpoint для останніх активностей без авторизації"""
    try:
        activities = get_recent_activities(db, limit=limit)
        return {
            "status": "success", 
            "data": activities,
            "count": len(activities) if activities else 0
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "data": []
        } 