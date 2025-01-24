from enum import Enum
from typing import Optional

from pydantic import BaseModel


class AddRequest(BaseModel):
    base_brightness: int
    active_brightness: int
    active_time: int
    park_id: Optional[int]


class LanternOut(BaseModel):
    id: int
    base_brightness: int
    active_brightness: int
    active_time: int
    status: str
    park_id: Optional[int]


class LanternStatus(str, Enum):
    WORKING = "working"
    MAINTENANCE = "maintenance"
