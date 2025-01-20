from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from admin.dependencies import get_current_admin
from admin.models import Administrator
from database import get_db
from lantern.crud import create_lantern, get_all_lanterns, delete_lantern
from lantern.schemas import LanternOut, AddRequest

router = APIRouter(prefix="/lantern", tags=["lantern"])


@router.post("/add")
async def create_new_lantern(
    lantern: AddRequest,
    db: Session = Depends(get_db),
    current_admin: Administrator = Depends(get_current_admin),
):
    create_lantern(db, lantern)
    return {"message": "Lantern created successfully"}


@router.get("/list", response_model=List[LanternOut])
async def get_list_lanterns(
    db: Session = Depends(get_db),
    current_admin: Administrator = Depends(get_current_admin),
):
    lanterns = get_all_lanterns(db)
    return lanterns


@router.delete("/delete/{lantern_id}", response_model=LanternOut)
async def remove_lantern(
    lantern_id: int,
    db: Session = Depends(get_db),
    current_admin: Administrator = Depends(get_current_admin),
):
    lantern = delete_lantern(db, lantern_id)
    return lantern
