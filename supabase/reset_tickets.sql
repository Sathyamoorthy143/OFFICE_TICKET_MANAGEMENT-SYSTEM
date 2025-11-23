-- Run this script in the Supabase SQL Editor to delete ALL tickets.
-- WARNING: This cannot be undone.

TRUNCATE TABLE tickets CASCADE;

-- Optional: Reset the ID sequence if you want ticket IDs to start from 1 again (if using integer IDs, but we use UUIDs so this is less relevant, but good for cleanup)
-- RESTART IDENTITY;
