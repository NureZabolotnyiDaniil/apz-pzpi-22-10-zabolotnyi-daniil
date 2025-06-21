-- Тригери для автоматичного оновлення статусу ліхтарів
-- Файл: create_sensor_response_triggers.sql

-- Тригер 1: При створенні нового запису в sensor_responses змінює статус ліхтаря на 'active'
CREATE OR REPLACE FUNCTION update_lantern_status_on_sensor_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Оновлюємо статус ліхтаря на 'active' при новому сенсорному відгуку
    UPDATE lanterns 
    SET status = 'active', updated_at = NOW()
    WHERE id = NEW.lantern_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Створюємо тригер для INSERT
CREATE TRIGGER trigger_sensor_response_insert
    AFTER INSERT ON sensor_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_lantern_status_on_sensor_insert();

-- Тригер 2: При зміні статусу sensor_response на 'deactivated' змінює статус ліхтаря на 'working'
CREATE OR REPLACE FUNCTION update_lantern_status_on_sensor_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Якщо статус змінився на 'deactivated', оновлюємо статус ліхтаря на 'working'
    IF OLD.status != NEW.status AND NEW.status = 'deactivated' THEN
        UPDATE lanterns 
        SET status = 'working', updated_at = NOW()
        WHERE id = NEW.lantern_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Створюємо тригер для UPDATE
CREATE TRIGGER trigger_sensor_response_update
    AFTER UPDATE ON sensor_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_lantern_status_on_sensor_update(); 