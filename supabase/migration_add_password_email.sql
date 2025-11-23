-- Script to add manager_email to existing departments
-- Run this after applying schema.sql if you already have departments created

UPDATE public.departments SET manager_email = 'it.manager@leroyalmeridienchennai.com' WHERE name = 'IT';
UPDATE public.departments SET manager_email = 'engineering.manager@leroyalmeridienchennai.com' WHERE name = 'Engineering';
UPDATE public.departments SET manager_email = 'housekeeping.manager@leroyalmeridienchennai.com' WHERE name = 'Housekeeping';
UPDATE public.departments SET manager_email = 'ird.manager@leroyalmeridienchennai.com' WHERE name = 'IRD';

-- Add password management columns to existing profiles (if not using fresh schema)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_changed_at timestamp with time zone default timezone('utc'::text, now()) not null;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_reset_required boolean default false;

-- Update existing users to set password_changed_at to now (first time setup)
UPDATE public.profiles SET password_changed_at = timezone('utc'::text, now()) WHERE password_changed_at IS NULL;
