-- Додавання поля status до таблиці sensor_responses
-- Файл: add_status_to_sensor_responses.sql

-- Додаємо колонку status з значенням за замовчуванням 'activated'
ALTER TABLE sensor_responses 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'activated';

-- Оновлюємо всі існуючі записи до статусу 'activated'
UPDATE sensor_responses 
SET status = 'activated' 
WHERE status IS NULL;

-- Додаємо check constraint для обмеження можливих значень
ALTER TABLE sensor_responses 
ADD CONSTRAINT check_sensor_response_status 
CHECK (status IN ('activated', 'deactivated'));

-- Створюємо індекс для швидкого пошуку по статусу
CREATE INDEX idx_sensor_responses_status ON sensor_responses(status);
CREATE INDEX idx_sensor_responses_lantern_date ON sensor_responses(lantern_id, date DESC); 