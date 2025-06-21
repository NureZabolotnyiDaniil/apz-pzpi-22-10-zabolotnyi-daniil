from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from routers.admin.dependencies import get_current_admin, get_full_access_admin
from models.admins import Admin
from .schemas import UpdateOut, UpdateCreate, UpdateUpdate
from .crud import get_updates, get_update, create_update, update_update, delete_update

router = APIRouter(prefix="/updates", tags=["Updates"])


@router.get("/", response_model=List[UpdateOut])
def list_updates(
    skip: int = Query(0, ge=0, description="Number of updates to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of updates to return"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Отримати список системних оновлень"""
    updates = get_updates(db, skip=skip, limit=limit)
    return updates


@router.get("/{update_id}", response_model=UpdateOut)
def get_update_by_id(
    update_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Отримати конкретне оновлення"""
    update = get_update(db, update_id)
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")
    return update


@router.post("/", response_model=UpdateOut)
def create_new_update(
    update_data: UpdateCreate,
    db: Session = Depends(get_db),
    full_access_admin: Admin = Depends(get_full_access_admin),
):
    """Створити нове системне оновлення (тільки для адмінів з повними правами)"""
    return create_update(db, update_data)


@router.put("/{update_id}", response_model=UpdateOut)
def update_existing_update(
    update_id: int,
    update_data: UpdateUpdate,
    db: Session = Depends(get_db),
    full_access_admin: Admin = Depends(get_full_access_admin),
):
    """Оновити існуюче системне оновлення (тільки для адмінів з повними правами)"""
    updated_update = update_update(db, update_id, update_data)
    if not updated_update:
        raise HTTPException(status_code=404, detail="Update not found")
    return updated_update


@router.delete("/{update_id}")
def delete_existing_update(
    update_id: int,
    db: Session = Depends(get_db),
    full_access_admin: Admin = Depends(get_full_access_admin),
):
    """Видалити системне оновлення (тільки для адмінів з повними правами)"""
    success = delete_update(db, update_id)
    if not success:
        raise HTTPException(status_code=404, detail="Update not found")
    return {"message": "Update deleted successfully"} 