from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class LanternOut(BaseModel):
    id: int
    name: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    power: Optional[int] = None
    height: Optional[float] = None
    base_brightness: int
    active_brightness: int
    brightness: Optional[int] = None  # For compatibility with frontend
    active_time: int
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    park_id: Optional[int] = None


class LanternStatus(str, Enum):
    WORKING = "working"
    MAINTENANCE = "maintenance"
