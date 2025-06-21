FROM python:3.11-slim

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо requirements файл
COPY requirements.txt .

# Встановлюємо системні залежності для PostgreSQL та інших бібліотек
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Встановлюємо Python залежності
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо весь код
COPY . .

# Створюємо non-root user для безпеки
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Відкриваємо порт
EXPOSE 8000

# Команда запуску
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"] 