from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from routers.admin.dependencies import get_current_admin
from models.admins import Admin
from database import get_db
from routers.lantern.schemas import LanternOut, LanternStatus
from routers.lantern.crud import (
    create_lantern_db as create_lantern,
    get_all_lanterns_from_db as get_all_lanterns,
    update_lantern_in_db as update_lantern,
    get_lantern_from_db as get_lantern,
    delete_lantern_from_db,
)

router = APIRouter(prefix="/lantern", tags=["lantern"])


@router.post("/add")
async def create_new_lantern(
    base_brightness: int = Query(
        0, ge=0, le=100, description="Base brightness (0-100%)"
    ),
    active_brightness: int = Query(
        0, ge=0, le=100, description="Active brightness (0-100%)"
    ),
    active_time: int = Query(5, ge=5, description="Active time in seconds (over 5s)"),
    status: Optional[LanternStatus] = Query("working", description="Lantern status"),
    park_id: Optional[int] = Query(None, description="Park"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    create_lantern(db, base_brightness, active_brightness, active_time, status, park_id, performed_by=current_admin.email)
    return {"message": "Lantern created successfully"}


@router.get("/list", response_model=List[LanternOut])
async def get_lantern_list(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    try:
        lanterns = get_all_lanterns(db)
        # Convert lanterns to serializable format
        lanterns_data = [
            {
                "id": l.id,
                "name": getattr(l, 'name', f"Ліхтар #{l.id}"),
                "park_id": l.park_id,
                "brand": getattr(l, 'brand', None),
                "model": getattr(l, 'model', None),
                "power": getattr(l, 'power', None),
                "height": getattr(l, 'height', None),
                "status": l.status,
                "base_brightness": getattr(l, 'base_brightness', 0),
                "active_brightness": getattr(l, 'active_brightness', 0),
                "brightness": getattr(l, 'active_brightness', getattr(l, 'base_brightness', 0)),  # For compatibility
                "active_time": getattr(l, 'active_time', None),
                "latitude": float(l.latitude) if l.latitude else None,
                "longitude": float(l.longitude) if l.longitude else None,
                "created_at": l.created_at.isoformat() if hasattr(l, 'created_at') and l.created_at else None,
                "updated_at": l.updated_at.isoformat() if hasattr(l, 'updated_at') and l.updated_at else None
            } for l in lanterns
        ]
        return JSONResponse(
            content=lanterns_data,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "success": False},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )


@router.get("/lantern/{lantern_id}", response_model=LanternOut)
def get_single_lantern(
    lantern_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    lantern = get_lantern(db, lantern_id)
    return lantern


@router.put("/update/{lantern_id}", response_model=LanternOut)
def update_lantern_details(
    lantern_id: int,
    base_brightness: int = Query(
        None, ge=0, le=100, description="Base brightness (0-100%)"
    ),
    active_brightness: int = Query(
        None, ge=0, le=100, description="Active brightness (0-100%)"
    ),
    active_time: int = Query(
        None, ge=5, description="Active time in seconds (over 5s)"
    ),
    status: LanternStatus = Query(None, description="Lantern status"),
    park_id: int = Query(None, description="Park. Enter '0' to reset the value"),
    latitude: float = Query(None, description="Lantern latitude coordinate"),
    longitude: float = Query(None, description="Lantern longitude coordinate"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    updated_lantern = update_lantern(
        db,
        lantern_id,
        base_brightness,
        active_brightness,
        active_time,
        status,
        park_id,
        latitude,
        longitude,
        performed_by=current_admin.email,
    )
    return updated_lantern


@router.delete("/delete/{lantern_id}", response_model=LanternOut)
async def delete_lantern(
    lantern_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    lantern = delete_lantern_from_db(db, lantern_id, performed_by=current_admin.email)
    return lantern
