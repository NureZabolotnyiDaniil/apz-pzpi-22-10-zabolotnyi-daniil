"""
Базова конфігурація SQLAlchemy для уникнення циклічних залежностей
"""
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base() 