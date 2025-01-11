-- Drop the new constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS chk_events_type;

-- Add back the original constraint without 'visit' type
ALTER TABLE events ADD CONSTRAINT chk_events_type CHECK (type IN ('culto', 'service', 'class', 'meeting', 'other')); 