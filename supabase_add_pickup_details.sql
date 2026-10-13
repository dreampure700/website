-- ==============================================================================
-- TEENSPACE 2026: ADD PICKUP LOCATION & TIME COLUMNS TO REGISTRATIONS TABLE
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Add pickup_point and pickup_time columns to public.registrations
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS pickup_point TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS pickup_time TEXT;

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_registrations_pickup_point ON public.registrations(pickup_point);

-- 3. Verification output
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'registrations' 
  AND column_name IN ('pickup_point', 'pickup_time', 'assigned_vehicle', 'pickup_order', 'picked_up');
