from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BreakdownOut(BaseModel):
    id: int
    lantern_id: int
    reported_at: datetime
    description: Optional[str]
    status: str
    priority: str
    fixed_at: Optional[datetime] = None
