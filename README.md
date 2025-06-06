# SmartLighting - Система розумного освітлення

Проект SmartLighting розділено на дві частини:
- **Backend** - FastAPI сервер для управління системою освітлення
- **Mobile** - Android додаток на Kotlin для мобільного управління

## Структура проекту

```
SmartLighting/
├── backend/                 # FastAPI бекенд
│   ├── main.py             # Головний файл додатку
│   ├── database.py         # Конфігурація бази даних
│   ├── models/             # SQLAlchemy моделі
│   ├── routers/            # API роутери
│   │   ├── mobile/         # Мобільні API endpoints
│   │   └── ...
│   └── iot/                # IoT компоненти
├── mobile/                 # Android додаток
│   ├── app/
│   │   ├── build.gradle    # Конфігурація Android проекту
│   │   └── src/main/
│   │       ├── java/com/smartlighting/
│   │       │   ├── MainActivity.kt
│   │       │   ├── data/           # Моделі даних та API
│   │       │   ├── ui/             # UI компоненти
│   │       │   └── service/        # Сервіси (push-сповіщення)
│   │       └── AndroidManifest.xml
│   └── build.gradle        # Конфігурація проекту
└── README.md
```

## Функціональні вимоги (реалізовані)

### Backend API Endpoints

#### FR.Моб.1: Отримання сповіщень про несправності
- `GET /mobile/notifications/breakdowns` - Отримання активних сповіщень
- `POST /mobile/notifications/register` - Реєстрація пристрою для push-сповіщень

#### FR.Моб.2: Перегляд поточного стану ліхтарів
- `GET /mobile/lanterns/status` - Статус всіх ліхтарів
- `GET /mobile/lanterns/{lantern_id}/status` - Статус конкретного ліхтаря

#### FR.Моб.3: Дистанційне керування ліхтарями
- `POST /mobile/lanterns/control` - Керування ліхтарем (увімкнути/вимкнути/яскравість)

#### FR.Моб.4: Перегляд історії несправностей
- `GET /mobile/history/breakdowns` - Історія несправностей з фільтрацією

### Mobile App Features

1. **Екран ліхтарів** - Перегляд статусу та керування ліхтарями
2. **Екран сповіщень** - Активні сповіщення про несправності
3. **Екран історії** - Історія несправностей з фільтрацією
4. **Push-сповіщення** - Реальний час сповіщення через Firebase

## Технології

### Backend
- **FastAPI** - Веб-фреймворк
- **SQLAlchemy** - ORM для роботи з базою даних
- **Pydantic** - Валідація даних
- **Python 3.8+**

### Mobile
- **Kotlin** - Мова програмування
- **Jetpack Compose** - Сучасний UI toolkit
- **Retrofit** - HTTP клієнт для API
- **Firebase Cloud Messaging** - Push-сповіщення
- **Material Design 3** - Дизайн система
- **Navigation Compose** - Навігація між екранами

## Запуск проекту

### Backend

1. Перейдіть до каталогу backend:
```bash
cd backend
```

2. Встановіть залежності:
```bash
pip install -r requirements.txt
```

3. Запустіть сервер:
```bash
uvicorn main:app --reload
```

API буде доступне за адресою: http://localhost:8000
Документація API: http://localhost:8000/docs

### Mobile

1. Відкрийте каталог `mobile` в Android Studio
2. Синхронізуйте проект з Gradle файлами
3. Налаштуйте Firebase проект:
   - Створіть проект у Firebase Console
   - Додайте Android додаток
   - Завантажте `google-services.json` до `mobile/app/`
4. Запустіть додаток на емуляторі або пристрої

## Конфігурація

### Backend
- Налаштуйте підключення до бази даних у `database.py`
- Змініть базову URL для API у мобільному додатку

### Mobile
- Змініть `BASE_URL` в API конфігурації
- Налаштуйте Firebase для push-сповіщень
- Додайте API ключі для карт (якщо потрібно)

## API Документація

Повна документація API доступна за адресою `/docs` після запуску backend сервера.

### Приклади запитів

#### Отримання статусу ліхтарів
```http
GET /mobile/lanterns/status
Authorization: Bearer <token>
```

#### Керування ліхтарем
```http
POST /mobile/lanterns/control
Content-Type: application/json
Authorization: Bearer <token>

{
  "lantern_id": 1,
  "action": "turn_on"
}
```

#### Встановлення яскравості
```http
POST /mobile/lanterns/control
Content-Type: application/json
Authorization: Bearer <token>

{
  "lantern_id": 1,
  "action": "set_brightness",
  "brightness": 75
}
```

## Розробка

### Додавання нових функцій

1. **Backend**: Додайте нові endpoints у `backend/routers/mobile/views.py`
2. **Mobile**: 
   - Додайте API методи у `SmartLightingApi.kt`
   - Оновіть репозиторій у `SmartLightingRepository.kt`
   - Додайте логіку у `MainViewModel.kt`
   - Створіть або оновіть UI компоненти

### Тестування

- Backend: Використовуйте FastAPI автоматичну документацію для тестування API
- Mobile: Використовуйте Android Studio для запуску та тестування додатку

## Безпека

- Всі API endpoints (крім реєстрації) захищені JWT токенами
- Push-сповіщення використовують Firebase Cloud Messaging
- Дані передаються через HTTPS

## Ліцензія

Цей проект створено для навчальних цілей. 