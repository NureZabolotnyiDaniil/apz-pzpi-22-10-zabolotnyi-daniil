from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from database import get_db
from models.lanterns import Lantern
from models.breakdowns import Breakdown
from models.sensor_responses import SensorResponse
from pydantic import BaseModel
import secrets
import qrcode
import io
import base64

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

# === НОВІ МОДЕЛІ ДЛЯ АВТОРИЗАЦІЇ ===
class QRAuthToken(BaseModel):
    token: str
    qr_code_base64: str
    expires_at: datetime

class AuthTokenValidation(BaseModel):
    token: str

class MessageRequest(BaseModel):
    title: str
    description: str
    location: str | None = None
    photo_base64: str | None = None
    priority: str = "medium"  # low, medium, high, critical

class MessageResponse(BaseModel):
    id: int
    title: str
    description: str
    created_at: datetime
    location: str | None = None
    photo_url: str | None = None
    priority: str
    status: str  # new, read, archived

# Тимчасове сховище для QR токенів (в продакшні має бути Redis або база даних)
qr_tokens_storage = {}

# === НОВІ ENDPOINTS ДЛЯ QR-АВТОРИЗАЦІЇ ===
@router.post("/auth/generate-qr", response_model=QRAuthToken)
async def generate_qr_auth_token():
    """
    Генерація QR-коду для авторизації мобільного додатку
    """
    # Генеруємо унікальний токен
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(minutes=10)  # Токен дійсний 10 хвилин
    
    # Створюємо QR-код з токеном
    qr_data = f"smartlighting://auth?token={token}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    # Конвертуємо QR-код в base64
    qr_img = qr.make_image(fill_color="black", back_color="white")
    img_buffer = io.BytesIO()
    qr_img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    qr_base64 = base64.b64encode(img_buffer.read()).decode()
    
    # Зберігаємо токен
    qr_tokens_storage[token] = {
        "expires_at": expires_at,
        "used": False
    }
    
    return QRAuthToken(
        token=token,
        qr_code_base64=qr_base64,
        expires_at=expires_at
    )

@router.post("/auth/validate-qr")
async def validate_qr_auth_token(validation: AuthTokenValidation):
    """
    Валідація QR-токену та авторизація мобільного пристрою
    """
    token = validation.token
    
    if token not in qr_tokens_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired token"
        )
    
    token_data = qr_tokens_storage[token]
    
    if datetime.now() > token_data["expires_at"]:
        del qr_tokens_storage[token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token expired"
        )
    
    if token_data["used"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token already used"
        )
    
    # Позначаємо токен як використаний
    qr_tokens_storage[token]["used"] = True
    
    # Генеруємо довгостроковий токен доступу
    access_token = secrets.token_urlsafe(48)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 86400 * 30,  # 30 днів
        "message": "Successfully authenticated"
    }

# === ENDPOINTS ДЛЯ ПОВІДОМЛЕНЬ ===
@router.post("/messages/report", response_model=MessageResponse)
async def report_issue(message: MessageRequest):
    """
    Відправка повідомлення про проблему від мобільного користувача
    """
    # Тут має бути логіка збереження повідомлення в базу даних
    # Поки що повертаємо mock відповідь
    
    return MessageResponse(
        id=1,  # Mock ID
        title=message.title,
        description=message.description,
        created_at=datetime.now(),
        location=message.location,
        photo_url=None,  # Тут має бути URL збереженого фото
        priority=message.priority,
        status="new"
    )

@router.get("/messages", response_model=List[MessageResponse])
async def get_user_messages():
    """
    Отримання списку повідомлень користувача
    """
    # Mock дані - в реальності дані беруться з бази
    return [
        MessageResponse(
            id=1,
            title="Несправний ліхтар",
            description="Ліхтар не світить вже тиждень",
            created_at=datetime.now() - timedelta(days=1),
            location="Парк Шевченка, алея 1",
            photo_url=None,
            priority="high",
            status="new"
        ),
        MessageResponse(
            id=2,
            title="Тьмяне світло",
            description="Ліхтар світить дуже тьмяно",
            created_at=datetime.now() - timedelta(days=3),
            location="Парк Перемоги, секція B",
            photo_url=None,
            priority="medium",
            status="read"
        )
    ]

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
        ).order_by(SensorResponse.date.desc()).first() # <--- Змінено на SensorResponse.date
        
        result.append(LanternStatus(
            id=lantern.id,
            status=lantern.status,
            active_brightness=lantern.active_brightness,
            base_brightness=lantern.base_brightness,
            park_id=lantern.park_id,
            last_response=last_response.date if last_response else None # <--- Змінено на last_response.date
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
    ).order_by(SensorResponse.date.desc()).first() # <--- Змінено на SensorResponse.date
    
    return LanternStatus(
        id=lantern.id,
        status=lantern.status,
        active_brightness=lantern.active_brightness,
        base_brightness=lantern.base_brightness,
        park_id=lantern.park_id,
        last_response=last_response.date if last_response else None # <--- Змінено на last_response.date
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