-- ==============================================================================
-- TEENSPACE 2026: SUPABASE TARGETS MIGRATION & REGISTRATIONS CLEANUP SCRIPT
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- STEP 1: Ensure columns exist on the targets table
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'zone';
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Update existing zone rows to have type = 'zone'
UPDATE public.targets SET type = 'zone' WHERE type IS NULL;

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_targets_type_zone ON public.targets(type, zone);
CREATE INDEX IF NOT EXISTS idx_targets_unit ON public.targets(unit);

-- STEP 2: Configure Row Level Security (RLS) policies for targets table (Anon read/write)
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon select on targets" ON public.targets;
    DROP POLICY IF EXISTS "Allow anon insert on targets" ON public.targets;
    DROP POLICY IF EXISTS "Allow anon update on targets" ON public.targets;
    DROP POLICY IF EXISTS "Allow anon delete on targets" ON public.targets;

    CREATE POLICY "Allow anon select on targets" ON public.targets FOR SELECT TO anon USING (true);
    CREATE POLICY "Allow anon insert on targets" ON public.targets FOR INSERT TO anon WITH CHECK (true);
    CREATE POLICY "Allow anon update on targets" ON public.targets FOR UPDATE TO anon USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon delete on targets" ON public.targets FOR DELETE TO anon USING (true);
END $$;

-- STEP 3: Migrate existing target records from registrations into targets

-- 3a. Migrate District Total Target
DELETE FROM public.targets WHERE type = 'district' OR zone = 'DISTRICT';
INSERT INTO public.targets (type, zone, unit, target)
SELECT 
    'district', 
    'DISTRICT', 
    NULL, 
    COALESCE(NULLIF(regexp_replace(phone, '[^0-9]', '', 'g'), '')::INTEGER, 0)
FROM public.registrations
WHERE reg_id = 'SYS_TARGET_district';

-- 3b. Migrate Zone Targets (or update existing zone rows if already in targets)
INSERT INTO public.targets (type, zone, unit, target)
SELECT 
    'zone', 
    zone, 
    NULL, 
    COALESCE(NULLIF(regexp_replace(phone, '[^0-9]', '', 'g'), '')::INTEGER, 0)
FROM public.registrations
WHERE reg_id ILIKE 'SYS_TARGET_zone_%'
  AND NOT EXISTS (
    SELECT 1 FROM public.targets t 
    WHERE t.type = 'zone' AND UPPER(t.zone) = UPPER(registrations.zone)
  );

-- Update target values for zones that already existed in targets table
UPDATE public.targets t
SET target = COALESCE(NULLIF(regexp_replace(r.phone, '[^0-9]', '', 'g'), '')::INTEGER, t.target)
FROM public.registrations r
WHERE r.reg_id ILIKE 'SYS_TARGET_zone_%'
  AND t.type = 'zone'
  AND (UPPER(t.zone) = UPPER(r.zone) OR UPPER(t.zone) = UPPER(r.zone || ' ZONE'));

-- 3c. Migrate Unit Targets
DELETE FROM public.targets WHERE type = 'unit';
INSERT INTO public.targets (type, zone, unit, target)
SELECT 
    'unit', 
    zone, 
    unit, 
    COALESCE(NULLIF(regexp_replace(phone, '[^0-9]', '', 'g'), '')::INTEGER, 0)
FROM public.registrations
WHERE reg_id ILIKE 'SYS_TARGET_unit_%';

-- STEP 4: CLEAN UP registrations table
-- Remove all 39 SYS_TARGET_ records so registrations only contains actual students
DELETE FROM public.registrations
WHERE reg_id ILIKE 'SYS_TARGET_%';

-- STEP 5: Verification output
SELECT 
    'Targets Count' AS metric, 
    COUNT(*)::text AS count 
FROM public.targets
UNION ALL
SELECT 
    'Remaining Registrations (Delegates)', 
    COUNT(*)::text 
FROM public.registrations;
