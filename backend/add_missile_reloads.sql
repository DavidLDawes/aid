-- Add missile_reloads column to ships table
-- This column stores the tonnage of missile reloads allocated for the ship

ALTER TABLE ships 
ADD COLUMN missile_reloads INT NOT NULL DEFAULT 0 
COMMENT 'Tonnage of missile reloads (1 MCr per ton)';

-- Verify the column was added
DESCRIBE ships;