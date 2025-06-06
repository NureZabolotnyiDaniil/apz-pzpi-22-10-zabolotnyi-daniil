from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models.lanterns import Lantern
from models.breakdowns import Breakdown
from models.sensor_responses import SensorResponse
from pydantic import BaseModel

router = APIRouter(prefix="/mobile", tags=["Mobile"])

# Pydantic models for mobile API
class LanternStatus(BaseModel):
    id: int
    status: str
    active_brightness: int
    base_brightness: int
    park_id: int | None = None
    last_response: datetime | None = None

class BreakdownNotification(BaseModel):
    id: int
    lantern_id: int
    date: datetime
    description: str | None = None
    is_resolved: bool = False

class ControlRequest(BaseModel):
    lantern_id: int
    action: str  # "turn_on", "turn_off", "set_brightness"
    brightness: int | None = None

# FR.Моб.2: Перегляд поточного стану ліхтарів
@router.get("/lanterns/status", response_model=List[LanternStatus])
async def get_lanterns_status(db: Session = Depends(get_db)):
    """
    Отримання поточного статусу всіх ліхтарів для відображення на карті/списку
    """
    lanterns = db.query(Lantern).all()
    result = []
    
    for lantern in lanterns:
        # Отримуємо останній сигнал від ліхтаря
        last_response = db.query(SensorResponse).filter(
            SensorResponse.lantern_id == lantern.id
        ).order_by(SensorResponse.timestamp.desc()).first()
        
        result.append(LanternStatus(
            id=lantern.id,
            status=lantern.status,
            active_brightness=lantern.active_brightness,
            base_brightness=lantern.base_brightness,
            park_id=lantern.park_id,
            last_response=last_response.timestamp if last_response else None
        ))
    
    return result

@router.get("/lanterns/{lantern_id}/status", response_model=LanternStatus)
async def get_lantern_status(lantern_id: int, db: Session = Depends(get_db)):
    """
    Отримання статусу конкретного ліхтаря
    """
    lantern = db.query(Lantern).filter(Lantern.id == lantern_id).first()
    if not lantern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lantern not found"
        )
    
    last_response = db.query(SensorResponse).filter(
        SensorResponse.lantern_id == lantern.id
    ).order_by(SensorResponse.timestamp.desc()).first()
    
    return LanternStatus(
        id=lantern.id,
        status=lantern.status,
        active_brightness=lantern.active_brightness,
        base_brightness=lantern.base_brightness,
        park_id=lantern.park_id,
        last_response=last_response.timestamp if last_response else None
    )

# FR.Моб.3: Дистанційне керування окремими ліхтарями
@router.post("/lanterns/control")
async def control_lantern(request: ControlRequest, db: Session = Depends(get_db)):
    """
    Дистанційне керування ліхтарем (увімкнути/вимкнути/змінити яскравість)
    """
    lantern = db.query(Lantern).filter(Lantern.id == request.lantern_id).first()
    if not lantern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lantern not found"
        )
    
    if request.action == "turn_on":
        lantern.status = "working"
        lantern.active_brightness = lantern.base_brightness
    elif request.action == "turn_off":
        lantern.status = "off"
        lantern.active_brightness = 0
    elif request.action == "set_brightness":
        if request.brightness is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Brightness value required for set_brightness action"
            )
        lantern.active_brightness = request.brightness
        lantern.status = "working" if request.brightness > 0 else "off"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Use: turn_on, turn_off, or set_brightness"
        )
    
    db.commit()
    db.refresh(lantern)
    
    return {"message": f"Lantern {request.lantern_id} control action '{request.action}' executed successfully"}

# FR.Моб.1: Отримання сповіщень про несправності
@router.get("/notifications/breakdowns", response_model=List[BreakdownNotification])
async def get_breakdown_notifications(db: Session = Depends(get_db)):
    """
    Отримання всіх активних сповіщень про несправності
    """
    breakdowns = db.query(Breakdown).filter(
        Breakdown.date >= datetime.now().replace(day=1)  # Поточний місяць
    ).order_by(Breakdown.date.desc()).all()
    
    result = []
    for breakdown in breakdowns:
        result.append(BreakdownNotification(
            id=breakdown.id,
            lantern_id=breakdown.lantern_id,
            date=breakdown.date,
            description=breakdown.description,
            is_resolved=False  # Можна додати поле до моделі в майбутньому
        ))
    
    return result

# FR.Моб.4: Перегляд історії несправностей
@router.get("/history/breakdowns", response_model=List[BreakdownNotification])
async def get_breakdown_history(
    lantern_id: int | None = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Отримання історії несправностей з можливістю фільтрації по ліхтарю
    """
    query = db.query(Breakdown)
    
    if lantern_id:
        query = query.filter(Breakdown.lantern_id == lantern_id)
    
    breakdowns = query.order_by(Breakdown.date.desc()).limit(limit).all()
    
    result = []
    for breakdown in breakdowns:
        result.append(BreakdownNotification(
            id=breakdown.id,
            lantern_id=breakdown.lantern_id,
            date=breakdown.date,
            description=breakdown.description,
            is_resolved=True  # Історичні записи вважаємо вирішеними
        ))
    
    return result

# Додатковий endpoint для push-сповіщень
@router.post("/notifications/register")
async def register_device_for_notifications(device_token: str):
    """
    Реєстрація пристрою для отримання push-сповіщень
    """
    # Тут має бути логіка збереження токену пристрою
    # для відправки push-сповіщень через Firebase Cloud Messaging
    return {"message": "Device registered for notifications", "token": device_token}

# Endpoint для перевірки статусу з'єднання з сервером
@router.get("/health")
async def health_check():
    """
    Перевірка стану сервера
    """
    return {"status": "ok", "timestamp": datetime.now()}