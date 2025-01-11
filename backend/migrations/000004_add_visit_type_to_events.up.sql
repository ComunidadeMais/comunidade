-- Drop the existing constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS chk_events_type;

-- Add the new constraint with 'visit' type
ALTER TABLE events ADD CONSTRAINT chk_events_type CHECK (type IN ('culto', 'service', 'class', 'meeting', 'visit', 'other')); 