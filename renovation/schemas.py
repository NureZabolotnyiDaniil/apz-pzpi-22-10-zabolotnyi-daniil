from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class AddRequest(BaseModel):
    lantern_id: int
    date: datetime
    status: str


class RenovationOut(BaseModel):
    id: int
    lantern_id: int
    date: datetime
    status: str


class RenovationStatus(str, Enum):
    PLANNED = "planned"
    COMPLETED = "completed"
    DEFERRED = "deferred"
    CANCELED = "canceled"
