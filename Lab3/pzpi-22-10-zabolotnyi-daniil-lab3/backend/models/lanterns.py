from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship

from database_base import Base


class Lantern(Base):
    __tablename__ = "lanterns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    model = Column(String, nullable=True)
    power = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)
    base_brightness = Column(Integer, nullable=False, default=50)
    active_brightness = Column(Integer, nullable=False, default=100)
    active_time = Column(Integer, nullable=False, default=30)
    status = Column(String, nullable=False, default="working")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)

    park_id = Column(Integer, ForeignKey("parks.id"), nullable=True)
    park = relationship("Park", back_populates="lanterns")

    renovations = relationship("Renovation", back_populates="lantern")
    breakdowns = relationship("Breakdown", back_populates="lantern")
    sensor_responses = relationship("SensorResponse", back_populates="lantern")
