from pydantic import BaseModel


class AddRequest(BaseModel):
    name: str
    address: str
    admin_id: int


class ParkOut(BaseModel):
    id: int
    name: str
    address: str
    admin_id: int
