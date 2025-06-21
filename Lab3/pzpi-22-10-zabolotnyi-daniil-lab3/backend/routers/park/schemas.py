from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ParkOut(BaseModel):
    id: int
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
