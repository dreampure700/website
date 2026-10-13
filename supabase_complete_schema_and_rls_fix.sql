-- ==============================================================================
-- TEENSPACE 2026: SUPABASE MASTER RLS & PERMISSIONS FIX SCRIPT
-- Fixes:
-- 1. "Error saving vehicle: new row violates row-level security policy for table vehicles"
-- 2. "new row violates row-level security policy for table targets"
-- 3. Cleans up unit target data mixed into registrations
-- 4. Ensures write policies for mapping, accounts, media, and settings
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. VEHICLES TABLE (Fixes "Error saving vehicle")
-- ------------------------------------------------------------------------------
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon select on vehicles" ON public.vehicles;
    DROP POLICY IF EXISTS "Allow anon insert on vehicles" ON public.vehicles;
    DROP POLICY IF EXISTS "Allow anon update on vehicles" ON public.vehicles;
    DROP POLICY IF EXISTS "Allow anon delete on vehicles" ON public.vehicles;

    CREATE POLICY "Allow anon select on vehicles" ON public.vehicles FOR SELECT TO anon USING (true);
    CREATE POLICY "Allow anon insert on vehicles" ON public.vehicles FOR INSERT TO anon WITH CHECK (true);
    CREATE POLICY "Allow anon update on vehicles" ON public.vehicles FOR UPDATE TO anon USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon delete on vehicles" ON public.vehicles FOR DELETE TO anon USING (true);
END $$;

-- ------------------------------------------------------------------------------
-- 2. TARGETS TABLE (Fixes target saving & separates from registrations)
-- ------------------------------------------------------------------------------
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'zone';
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

UPDATE public.targets SET type = 'zone' WHERE type IS NULL;

CREATE INDEX IF NOT EXISTS idx_targets_type_zone ON public.targets(type, zone);
CREATE INDEX IF NOT EXISTS idx_targets_unit ON public.targets(unit);

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

-- Migrate District Target
DELETE FROM public.targets WHERE type = 'district' OR zone = 'DISTRICT';
INSERT INTO public.targets (type, zone, unit, target)
SELECT 
    'district', 
    'DISTRICT', 
    NULL, 
    COALESCE(NULLIF(regexp_replace(phone, '[^0-9]', '', 'g'), '')::INTEGER, 0)
FROM public.registrations
WHERE reg_id = 'SYS_TARGET_district';

-- Migrate Zone Targets
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

UPDATE public.targets t
SET target = COALESCE(NULLIF(regexp_replace(r.phone, '[^0-9]', '', 'g'), '')::INTEGER, t.target)
FROM public.registrations r
WHERE r.reg_id ILIKE 'SYS_TARGET_zone_%'
  AND t.type = 'zone'
  AND (UPPER(t.zone) = UPPER(r.zone) OR UPPER(t.zone) = UPPER(r.zone || ' ZONE'));

-- Migrate Unit Targets
DELETE FROM public.targets WHERE type = 'unit';
INSERT INTO public.targets (type, zone, unit, target)
SELECT 
    'unit', 
    zone, 
    unit, 
    COALESCE(NULLIF(regexp_replace(phone, '[^0-9]', '', 'g'), '')::INTEGER, 0)
FROM public.registrations
WHERE reg_id ILIKE 'SYS_TARGET_unit_%';

-- Clean up registrations table
DELETE FROM public.registrations WHERE reg_id ILIKE 'SYS_TARGET_%';

-- ------------------------------------------------------------------------------
-- 3. MAPPING TABLE (Allows editing/adding panchayath/ward mapping)
-- ------------------------------------------------------------------------------
ALTER TABLE public.mapping ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon select on mapping" ON public.mapping;
    DROP POLICY IF EXISTS "Allow anon insert on mapping" ON public.mapping;
    DROP POLICY IF EXISTS "Allow anon update on mapping" ON public.mapping;
    DROP POLICY IF EXISTS "Allow anon delete on mapping" ON public.mapping;

    CREATE POLICY "Allow anon select on mapping" ON public.mapping FOR SELECT TO anon USING (true);
    CREATE POLICY "Allow anon insert on mapping" ON public.mapping FOR INSERT TO anon WITH CHECK (true);
    CREATE POLICY "Allow anon update on mapping" ON public.mapping FOR UPDATE TO anon USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon delete on mapping" ON public.mapping FOR DELETE TO anon USING (true);
END $$;

-- ------------------------------------------------------------------------------
-- 4. ACCOUNTS TABLE (Allows managing zone/unit admin passwords)
-- ------------------------------------------------------------------------------
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon select on accounts" ON public.accounts;
    DROP POLICY IF EXISTS "Allow anon insert on accounts" ON public.accounts;
    DROP POLICY IF EXISTS "Allow anon update on accounts" ON public.accounts;
    DROP POLICY IF EXISTS "Allow anon delete on accounts" ON public.accounts;

    CREATE POLICY "Allow anon select on accounts" ON public.accounts FOR SELECT TO anon USING (true);
    CREATE POLICY "Allow anon insert on accounts" ON public.accounts FOR INSERT TO anon WITH CHECK (true);
    CREATE POLICY "Allow anon update on accounts" ON public.accounts FOR UPDATE TO anon USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon delete on accounts" ON public.accounts FOR DELETE TO anon USING (true);
END $$;

-- ------------------------------------------------------------------------------
-- 5. MEDIA & SETTINGS TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on media" ON public.media;
    CREATE POLICY "Allow anon all on media" ON public.media FOR ALL TO anon USING (true) WITH CHECK (true);
END $$;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on settings" ON public.settings;
    CREATE POLICY "Allow anon all on settings" ON public.settings FOR ALL TO anon USING (true) WITH CHECK (true);
END $$;

-- ------------------------------------------------------------------------------
-- VERIFICATION SUMMARY
-- ------------------------------------------------------------------------------
SELECT 'vehicles' AS table_name, count(*)::text AS row_count FROM public.vehicles
UNION ALL
SELECT 'targets', count(*)::text FROM public.targets
UNION ALL
SELECT 'registrations (delegates only)', count(*)::text FROM public.registrations;
