from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Lantern(Base):
    __tablename__ = "lanterns"
    id = Column(Integer, primary_key=True, index=True)
    base_brightness = Column(Integer, nullable=False)
    active_brightness = Column(Integer, nullable=False)
    active_time = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="working")

    renovations = relationship("Renovation", back_populates="lantern")
