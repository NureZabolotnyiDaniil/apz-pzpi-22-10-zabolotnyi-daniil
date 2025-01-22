from enum import Enum
from pydantic import BaseModel


class AddRequest(BaseModel):
    base_brightness: int
    active_brightness: int
    active_time: int


class LanternOut(BaseModel):
    id: int
    base_brightness: int
    active_brightness: int
    active_time: int
    status: str


class LanternStatus(str, Enum):
    WORKING = "working"
    MAINTENANCE = "maintenance"
