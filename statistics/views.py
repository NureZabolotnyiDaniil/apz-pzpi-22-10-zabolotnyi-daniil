import time
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from admin.dependencies import get_current_admin
from models.admins import Admin
from database import get_db

from datetime import datetime

from models.parks import Park
from renovation.schemas import RenovationStatus, RenovationOut
from renovation.crud import (
    create_renovation_db as create_renovation,
    get_all_renovations_from_db as get_all_renovations,
    update_renovation_in_db as update_renovation,
    get_renovation_from_db as get_renovation,
    delete_renovation_from_db,
)
from sqlalchemy import text

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.post("")
async def get_statistics(
    park_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    park = db.query(Park).filter(Park.id == park_id).first()
    if not park:
        raise HTTPException(status_code=404, detail="Park not found")

    # Fetch activated lanterns
    activated_lanterns = db.execute(
        text("SELECT * FROM get_top_activated_lanterns(:park_id)"), {"park_id": park_id}
    )
    columns = ["id", "activation_count"]
    formatted_activated_lanterns = [
        dict(zip(columns, row)) for row in activated_lanterns.fetchall()
    ]

    # Fetch lanterns needing renovation
    needing_renovation = db.execute(
        text("SELECT * FROM get_lanterns_needing_renovation(:park_id)"),
        {"park_id": park_id},
    )
    columns = ["id", "last_renovation_date"]
    formatted_needing_renovation = [
        dict(zip(columns, row)) for row in needing_renovation.fetchall()
    ]

    # Fetch planned renovations
    planned_renovations = db.execute(
        text("SELECT * FROM get_planned_renovations(:park_id)"),
        {"park_id": park_id},
    )
    columns = ["id", "lantern_id", "date"]
    formatted_planned_renovations = [
        dict(zip(columns, row)) for row in planned_renovations.fetchall()
    ]

    return {
        "top_activated_lanterns": formatted_activated_lanterns,
        "lanterns_needing_renovation": formatted_needing_renovation,
        "planned_renovations": formatted_planned_renovations,
    }

    # try:
    #     date_obj = datetime.strptime(date, DATE_FORMAT)
    #     time_obj = datetime.strptime(time, TIME_FORMAT)
    #
    #     datetime_combined = datetime.combine(date_obj, time_obj.time())
    #
    #     create_renovation(db, lantern_id, datetime_combined, status)
    #     return {"message": "Renovation added successfully"}
    # except ValueError:
    #     raise HTTPException(
    #         status_code=400,
    #         detail=f"Invalid date or time format. Expected formats are {DATE_FORMAT} and {TIME_FORMAT} respectively.",
    #     )


# @router.get("/list", response_model=List[RenovationOut])
# async def get_renovation_list(
#     db: Session = Depends(get_db),
#     current_admin: Admin = Depends(get_current_admin),
# ):
#     renovations = get_all_renovations(db)
#
#     formatted_renovations = []
#     for renovation in renovations:
#         renovation_out = RenovationOut(**vars(renovation))
#         renovation_out.date = renovation.date.strftime(DATETIME_FORMAT)
#         formatted_renovations.append(renovation_out)
#
#     return formatted_renovations
#
#
# @router.get("/info/{renovation_id}", response_model=RenovationOut)
# def get_single_renovation(
#     renovation_id: int,
#     db: Session = Depends(get_db),
#     current_admin: Admin = Depends(get_current_admin),
# ):
#     renovation = get_renovation(db, renovation_id)
#
#     formatted_renovation = RenovationOut(**vars(renovation))
#     formatted_renovation.date = renovation.date.strftime(DATETIME_FORMAT)
#     return formatted_renovation
#
#
# @router.put("/update/{renovation_id}", response_model=RenovationOut)
# def update_renovation_details(
#     renovation_id: int,
#     lantern_id: Optional[int] = Query(
#         None, description="Foreign key of the table 'lanterns'"
#     ),
#     date: str = Query(
#         None,
#         description=f"Date in format {DATE_FORMAT}",
#     ),
#     time: str = Query(
#         None,
#         description=f"Time in format {TIME_FORMAT}",
#     ),
#     status: Optional[RenovationStatus] = Query(None, description="Renovation status"),
#     db: Session = Depends(get_db),
#     current_admin: Admin = Depends(get_current_admin),
# ):
#     renovation = update_renovation(
#         db,
#         renovation_id,
#         lantern_id,
#         date,
#         time,
#         DATE_FORMAT,
#         TIME_FORMAT,
#         status,
#     )
#
#     formatted_renovation = RenovationOut(**vars(renovation))
#     formatted_renovation.date = renovation.date.strftime(DATETIME_FORMAT)
#     return formatted_renovation
#
#
# @router.delete("/delete/{renovation_id}", response_model=RenovationOut)
# async def delete_renovation(
#     renovation_id: int,
#     db: Session = Depends(get_db),
#     current_admin: Admin = Depends(get_current_admin),
# ):
#     renovation = delete_renovation_from_db(db, renovation_id)
#
#     formatted_renovation = RenovationOut(**vars(renovation))
#     formatted_renovation.date = renovation.date.strftime(DATETIME_FORMAT)
#     return formatted_renovation
