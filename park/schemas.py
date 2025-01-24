from pydantic import BaseModel


class AddRequest(BaseModel):
    name: str
    location: str
    admin_id: int


class ParkOut(BaseModel):
    id: int
    name: str
    location: str
    admin_id: int
