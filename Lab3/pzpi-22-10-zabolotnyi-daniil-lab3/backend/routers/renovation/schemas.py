from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class RenovationOut(BaseModel):
    id: int
    lantern_id: Optional[int]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    status: str
    cost: int
    repairman_id: Optional[int]
    description: Optional[str]
    priority: str
    
    # Для зворотної сумісності з фронтендом
    date: Optional[str] = None


class RenovationStatus(str, Enum):
    PLANNED = "planned"
    COMPLETED = "completed"
    DEFERRED = "deferred"
    CANCELED = "canceled"
