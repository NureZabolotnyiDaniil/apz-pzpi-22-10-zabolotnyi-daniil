-- Міграція для додавання колонки description до таблиці renovations
-- Дата: 2024

-- Перевіряємо, чи існує колонка, перш ніж додавати її
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'renovations' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE renovations ADD COLUMN description VARCHAR;
        RAISE NOTICE 'Column description added to renovations table';
    ELSE
        RAISE NOTICE 'Column description already exists in renovations table';
    END IF;
END
$$; 