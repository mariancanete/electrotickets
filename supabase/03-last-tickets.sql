ALTER TABLE events
ADD COLUMN IF NOT EXISTS last_tickets boolean NOT NULL DEFAULT false;
