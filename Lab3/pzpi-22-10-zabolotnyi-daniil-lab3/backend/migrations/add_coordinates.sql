-- Migration to add coordinates support to lanterns and parks
-- Run this SQL script to add latitude and longitude columns

-- Add coordinates to parks table
ALTER TABLE parks ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Add coordinates to lanterns table  
ALTER TABLE lanterns ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE lanterns ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Add comments for documentation
COMMENT ON COLUMN parks.latitude IS 'Park latitude coordinate for map display';
COMMENT ON COLUMN parks.longitude IS 'Park longitude coordinate for map display';
COMMENT ON COLUMN lanterns.latitude IS 'Lantern latitude coordinate for map positioning';
COMMENT ON COLUMN lanterns.longitude IS 'Lantern longitude coordinate for map positioning'; 