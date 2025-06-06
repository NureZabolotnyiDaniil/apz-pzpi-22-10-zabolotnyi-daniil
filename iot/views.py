from datetime import datetime

from fastapi import FastAPI, HTTPException
from sqlalchemy.orm import Session

from models.breakdowns import Breakdown
from models.lanterns import Lantern
from models.sensor_responses import SensorResponse

app = FastAPI()


# Эндпоинт для получения настроек
@app.get("/lanterns/{lantern_id}/settings")
async def get_settings(db: Session, lantern_id: int):
    settings = db.query(Lantern).filter_by(id=lantern_id).first()
    if not settings:
        raise HTTPException(status_code=404)
    return {
        "base_brightness": settings.base_brightness,
        "active_brightness": settings.active_brightness,
        "active_time": settings.active_time,
    }


# Эндпоинт для логирования движения
@app.post("/lanterns/{lantern_id}/motion")
async def log_motion(db: Session, lantern_id: int):
    db.add(SensorResponse(lantern_id=lantern_id, date=datetime.now()))
    db.commit()
    return {"status": "logged"}


# Эндпоинт для ошибок
@app.post("/lanterns/{lantern_id}/fault")
async def log_fault(db: Session, lantern_id: int, error_type: str, value: float):
    db.add(
        Breakdown(
            lantern_id=lantern_id,
            date=datetime.now(),
            description=error_type + f"; {value}",
        )
    )
    db.commit()
    return {"status": "error_logged"}


# Эндпоинт для перезагрузки
@app.post("/lanterns/{lantern_id}/reboot")
async def reboot(lantern_id: int):
    # Логика для HTTP вместо MQTT
    return {"status": "reboot_command_received"}


# Эндпоинт для статуса
@app.get("/lanterns/{lantern_id}/status")
async def get_status(lantern_id: int):
    # Логика для HTTP вместо MQTT
    return {"status": "online", "voltage": 3.3}
