from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database_base import Base

class Update(Base):
    __tablename__ = 'updates'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    version = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Update(id={self.id}, title='{self.title}', version='{self.version}')>" 