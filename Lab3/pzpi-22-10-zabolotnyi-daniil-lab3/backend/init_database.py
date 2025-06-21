#!/usr/bin/env python3
"""
Скрипт для ініціалізації бази даних та створення всіх таблиць
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Додаємо поточну директорію до Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

# Імпортуємо Base та всі моделі
from database_base import Base

# Імпортуємо всі моделі для реєстрації з SQLAlchemy
from models.admins import Admin
from models.lanterns import Lantern
from models.parks import Park
from models.breakdowns import Breakdown
from models.renovations import Renovation
from models.companies import Company
from models.repairmans import Repairman
from models.updates import Update
from models.db_activity import DatabaseActivity
from models.sensor_responses import SensorResponse
from models.db_activity import ActivityType

def get_database_url():
    """Отримати URL бази даних з змінних оточення"""
    DB_NAME = os.getenv("POSTGRESQL_DB_NAME", "smartlighting")
    DB_USER = os.getenv("POSTGRESQL_DB_USER", "postgres")
    DB_PASSWORD = os.getenv("POSTGRESQL_PASSWORD", "password")
    DB_HOST = os.getenv("POSTGRESQL_DB_HOST", "localhost")
    DB_PORT = os.getenv("POSTGRESQL_DB_PORT", "5432")
    
    return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def create_database_if_not_exists():
    """Створити базу даних якщо вона не існує"""
    DB_NAME = os.getenv("POSTGRESQL_DB_NAME", "smartlighting")
    DB_USER = os.getenv("POSTGRESQL_DB_USER", "postgres")
    DB_PASSWORD = os.getenv("POSTGRESQL_PASSWORD", "password")
    DB_HOST = os.getenv("POSTGRESQL_DB_HOST", "localhost")
    DB_PORT = os.getenv("POSTGRESQL_DB_PORT", "5432")
    
    # Підключаємося до PostgreSQL без вказівки бази даних
    admin_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres"
    
    try:
        admin_engine = create_engine(admin_url)
        with admin_engine.connect() as conn:
            # Перевіряємо чи існує база даних
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'"))
            exists = result.fetchone()
            
            if not exists:
                print(f"Creating database '{DB_NAME}'...")
                # Закриваємо поточну транзакцію
                conn.execute(text("COMMIT"))
                # Створюємо базу даних
                conn.execute(text(f"CREATE DATABASE {DB_NAME}"))
                print(f"Database '{DB_NAME}' created successfully!")
            else:
                print(f"Database '{DB_NAME}' already exists.")
                
    except Exception as e:
        print(f"Error creating database: {e}")
        print("Please make sure PostgreSQL is running and credentials are correct.")
        return False
    
    return True

def create_tables():
    """Створити всі таблиці в базі даних"""
    database_url = get_database_url()
    
    try:
        engine = create_engine(database_url, echo=True)
        print("Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print("All tables created successfully!")
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False

def insert_sample_data():
    """Вставити початкові дані для тестування"""
    from sqlalchemy.orm import sessionmaker
    
    database_url = get_database_url()
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Створити тестового адміна
        admin = db.query(Admin).filter(Admin.email == "admin@test.com").first()
        if not admin:
            admin = Admin(
                first_name="Test Admin",
                surname="Administrator",
                email="admin@test.com",
                password="password123",  # В реальному додатку має бути хешований
                status="active",
                rights="full_access"
            )
            db.add(admin)
            print("Created test admin: admin@test.com / password123")

        # Створити тестовий парк
        park = db.query(Park).filter(Park.name == "Центральний парк").first()
        if not park:
            park = Park(
                name="Центральний парк",
                address="вул. Хрещатик, 1, Київ",
                latitude=50.4501,
                longitude=30.5234
            )
            db.add(park)
            db.commit()
            db.refresh(park)
            print("Created test park: Центральний парк")

        # Створити тестові ліхтарі
        lantern1 = db.query(Lantern).filter(Lantern.id == 1).first()
        if not lantern1:
            lantern1 = Lantern(
                park_id=park.id,
                latitude=50.4501,
                longitude=30.5234,
                status="working",
                base_brightness=80,
                active_brightness=100,
                model="LED-100",
                brand="LightTech"
            )
            db.add(lantern1)

        lantern2 = db.query(Lantern).filter(Lantern.id == 2).first()
        if not lantern2:
            lantern2 = Lantern(
                park_id=park.id,
                latitude=50.4505,
                longitude=30.5240,
                status="working",
                base_brightness=0,
                active_brightness=0,
                model="LED-100",
                brand="LightTech"
            )
            db.add(lantern2)

        # Створити тестову активність
        activity = db.query(DatabaseActivity).first()
        if not activity:
            activity = DatabaseActivity(
                activity_type=ActivityType.SYSTEM_UPDATE,
                entity_type="system",
                entity_id=None,
                description="Система ініціалізована",
                details="Створені початкові дані для тестування",
                performed_by="system",
                created_at=datetime.utcnow()
            )
            db.add(activity)

        # Створюємо тестові активності
        activities = [
            DatabaseActivity(
                activity_type=ActivityType.LANTERN_CREATED,
                entity_type="lantern",
                entity_id=1,
                description="Створено ліхтар 'Ліхтар #1'",
                details="Парк: Центральний парк, Потужність: 50W",
                performed_by="admin@test.com",
                created_at=datetime.utcnow() - timedelta(hours=2)
            ),
            DatabaseActivity(
                activity_type=ActivityType.LANTERN_UPDATED,
                entity_type="lantern", 
                entity_id=1,
                description="Оновлено ліхтар 'Ліхтар #1'",
                details="Статус: 'working' → 'broken'",
                performed_by="admin@test.com",
                created_at=datetime.utcnow() - timedelta(hours=1)
            ),
            DatabaseActivity(
                activity_type=ActivityType.USER_CREATED,
                entity_type="admin",
                entity_id=1,
                description="Створено адміністратора 'Test Admin'",
                details="Email: admin@test.com",
                performed_by="system",
                created_at=datetime.utcnow() - timedelta(hours=3)
            )
        ]
        
        for activity in activities:
            db.add(activity)
        
        # Створюємо тестові компанії
        companies = [
            Company(
                name="ТехСервіс Україна",
                email="info@techservice.ua",
                address="вул. Технічна, 15, Харків",
                phone="+380501234567",
                notes="Спеціалізується на LED освітленні"
            ),
            Company(
                name="ЕлектроМайстер",
                email="contact@electromaster.com",
                address="пр. Науки, 42, Харків",
                phone="+380671234567",
                notes="Швидкий ремонт електрообладнання"
            ),
            Company(
                name="СмартЛайт Сервіс",
                email="service@smartlight.ua",
                address="вул. Сумська, 78, Харків",
                phone="+380931234567",
                notes="Розумне освітлення та автоматизація"
            )
        ]
        
        for company in companies:
            db.add(company)
        
        db.commit()
        
        # Створюємо тестових ремонтників
        repairmen = [
            Repairman(
                first_name="Олександр",
                surname="Петренко",
                email="o.petrenko@techservice.ua",
                company_id=1  # ТехСервіс Україна
            ),
            Repairman(
                first_name="Марія",
                surname="Іваненко",
                email="m.ivanenko@electromaster.com",
                company_id=2  # ЕлектроМайстер
            ),
            Repairman(
                first_name="Дмитро",
                surname="Коваленко",
                email="d.kovalenko@smartlight.ua",
                company_id=3  # СмартЛайт Сервіс
            ),
            Repairman(
                first_name="Анна",
                surname="Сидоренко",
                email="a.sidorenko@freelance.com",
                company_id=None  # Фрілансер
            )
        ]
        
        for repairman in repairmen:
            db.add(repairman)
        
        db.commit()
        
        # Створюємо активності для компаній та ремонтників
        company_activities = [
            DatabaseActivity(
                activity_type=ActivityType.USER_CREATED,
                entity_type="company",
                entity_id=1,
                description="Створено компанію 'ТехСервіс Україна'",
                details="Email: info@techservice.ua, Адреса: вул. Технічна, 15, Харків",
                performed_by="admin@test.com",
                created_at=datetime.utcnow() - timedelta(hours=4)
            ),
            DatabaseActivity(
                activity_type=ActivityType.USER_CREATED,
                entity_type="repairman",
                entity_id=1,
                description="Створено ремонтника 'Олександр Петренко'",
                details="Email: o.petrenko@techservice.ua, Компанія: ТехСервіс Україна",
                performed_by="admin@test.com",
                created_at=datetime.utcnow() - timedelta(hours=3)
            )
        ]
        
        for activity in company_activities:
            db.add(activity)
        
        db.commit()
        
        print("Sample data inserted successfully!")
        
    except Exception as e:
        print(f"Error inserting sample data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Головна функція"""
    print("=== SmartLighting Database Initialization ===")
    print()
    
    # Крок 1: Створити базу даних
    if not create_database_if_not_exists():
        return False
    
    # Крок 2: Створити таблиці
    if not create_tables():
        return False
    
    # Крок 3: Вставити початкові дані
    insert_sample_data()
    
    print()
    print("=== Database initialization completed! ===")
    print("You can now start the backend server.")
    return True

if __name__ == "__main__":
    main() 