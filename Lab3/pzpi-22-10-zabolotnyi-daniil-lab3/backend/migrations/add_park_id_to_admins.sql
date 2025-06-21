-- Migration to add park_id to admins table
-- Run this SQL script to add park assignment to admins

-- Add park_id column to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS park_id INTEGER;

-- Add foreign key constraint (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_admin_park' AND table_name = 'admins'
    ) THEN
        ALTER TABLE admins ADD CONSTRAINT fk_admin_park 
            FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_admins_park_id ON admins(park_id);

-- Add comment for documentation
COMMENT ON COLUMN admins.park_id IS 'ID of the park assigned to this admin';

-- Update existing admin with first park (if exists)
UPDATE admins SET park_id = (SELECT id FROM parks ORDER BY id LIMIT 1) 
WHERE park_id IS NULL AND EXISTS (SELECT 1 FROM parks); 