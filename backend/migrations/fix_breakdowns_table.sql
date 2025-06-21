-- Migration to add missing columns to breakdowns table
-- This fixes the schema mismatch between the model and database

-- Add missing columns
ALTER TABLE breakdowns ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'reported';
ALTER TABLE breakdowns ADD COLUMN IF NOT EXISTS priority VARCHAR(50) NOT NULL DEFAULT 'medium';
ALTER TABLE breakdowns ADD COLUMN IF NOT EXISTS reported_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE breakdowns ADD COLUMN IF NOT EXISTS fixed_at TIMESTAMP WITHOUT TIME ZONE;

-- If there's an existing 'date' column, copy its values to reported_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'breakdowns' AND column_name = 'date') THEN
        UPDATE breakdowns SET reported_at = date WHERE reported_at IS NULL;
        ALTER TABLE breakdowns DROP COLUMN date;
    END IF;
END
$$;

-- Set reported_at to current timestamp for existing records if null
UPDATE breakdowns SET reported_at = CURRENT_TIMESTAMP WHERE reported_at IS NULL;

-- Add NOT NULL constraint to reported_at after setting values
ALTER TABLE breakdowns ALTER COLUMN reported_at SET NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN breakdowns.status IS 'Status of the breakdown (reported, in_progress, fixed)';
COMMENT ON COLUMN breakdowns.priority IS 'Priority level (low, medium, high, critical)';
COMMENT ON COLUMN breakdowns.reported_at IS 'When the breakdown was reported';
COMMENT ON COLUMN breakdowns.fixed_at IS 'When the breakdown was fixed (null if not fixed yet)'; 