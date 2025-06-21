from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UpdateBase(BaseModel):
    title: str
    content: str
    version: Optional[str] = None


class UpdateCreate(UpdateBase):
    pass


class UpdateUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    version: Optional[str] = None


class UpdateOut(UpdateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 