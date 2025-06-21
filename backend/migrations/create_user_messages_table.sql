-- Міграція: Створення таблиці user_messages
-- Дата: 2024-12-28
-- Опис: Таблиця для збереження повідомлень від мобільних користувачів

CREATE TABLE IF NOT EXISTS user_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(500),
    photo_url VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'new',
    device_token VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    admin_response TEXT,
    is_public BOOLEAN DEFAULT 1
);

-- Індекси для оптимізації запитів
CREATE INDEX IF NOT EXISTS idx_user_messages_status ON user_messages(status);
CREATE INDEX IF NOT EXISTS idx_user_messages_priority ON user_messages(priority);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_messages_device_token ON user_messages(device_token);

-- Тригер для автоматичного оновлення updated_at
CREATE TRIGGER IF NOT EXISTS update_user_messages_updated_at
    AFTER UPDATE ON user_messages
BEGIN
    UPDATE user_messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

COMMIT; 