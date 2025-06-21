-- Створення таблиці для відстеження активності в базі даних
CREATE TABLE IF NOT EXISTS database_activities (
    id SERIAL PRIMARY KEY,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    description TEXT NOT NULL,
    details TEXT,
    performed_by VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Створення індексів для покращення продуктивності
CREATE INDEX IF NOT EXISTS idx_database_activities_activity_type ON database_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_database_activities_entity_type ON database_activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_database_activities_created_at ON database_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_database_activities_performed_by ON database_activities(performed_by);

-- Додавання коментарів до таблиці та колонок
COMMENT ON TABLE database_activities IS 'Таблиця для відстеження всіх змін та активності в системі';
COMMENT ON COLUMN database_activities.activity_type IS 'Тип активності (lantern_created, park_updated, тощо)';
COMMENT ON COLUMN database_activities.entity_type IS 'Тип сутності (lantern, park, breakdown, тощо)';
COMMENT ON COLUMN database_activities.entity_id IS 'ID сутності, з якою пов''язана активність';
COMMENT ON COLUMN database_activities.description IS 'Опис активності';
COMMENT ON COLUMN database_activities.details IS 'Додаткові деталі у форматі JSON';
COMMENT ON COLUMN database_activities.performed_by IS 'Користувач, який виконав дію';
COMMENT ON COLUMN database_activities.created_at IS 'Час створення запису'; 