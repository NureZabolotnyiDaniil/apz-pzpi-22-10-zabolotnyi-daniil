from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from database import Base


class Renovation(Base):
    __tablename__ = "renovations"

    id = Column(Integer, primary_key=True, index=True)

    lantern_id = Column(Integer, ForeignKey("lanterns.id"), nullable=False)
    lantern = relationship("Lantern", back_populates="renovations")

    date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="planned")
