-- ==============================================================================
-- TEENSPACE 2026: SUPABASE MASTER RLS & PERMISSIONS FIX SCRIPT
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
-- 2. TARGETS TABLE (Fixes target saving, duplicate zone key, & separates from registrations)
-- ------------------------------------------------------------------------------
-- DROP old single-column unique constraint on zone that blocked multiple units in the same zone
ALTER TABLE public.targets DROP CONSTRAINT IF EXISTS targets_zone_key;

-- Ensure columns exist
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'zone';
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

UPDATE public.targets SET type = 'zone' WHERE type IS NULL;

-- Fast indexes
CREATE INDEX IF NOT EXISTS idx_targets_type_zone ON public.targets(type, zone);
CREATE INDEX IF NOT EXISTS idx_targets_unit ON public.targets(unit);

-- RLS policies on targets table
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

-- 2a. Migrate District Total Target
DELETE FROM public.targets WHERE type = 'district' OR UPPER(zone) = 'DISTRICT';
INSERT INTO public.targets (type, zone, unit, target)
SELECT 
    'district', 
    'DISTRICT', 
    NULL, 
    COALESCE(NULLIF(regexp_replace(phone, '[^0-9]', '', 'g'), '')::INTEGER, 0)
FROM public.registrations
WHERE reg_id = 'SYS_TARGET_district';

-- 2b. Migrate Zone Targets (Update existing zones or insert missing ones)
UPDATE public.targets t
SET 
    target = COALESCE(NULLIF(regexp_replace(r.phone, '[^0-9]', '', 'g'), '')::INTEGER, t.target),
    type = 'zone'
FROM public.registrations r
WHERE r.reg_id ILIKE 'SYS_TARGET_zone_%'
  AND (UPPER(t.zone) = UPPER(r.zone) OR UPPER(t.zone) = UPPER(r.name) OR UPPER(t.zone) = UPPER(r.zone || ' ZONE'));

INSERT INTO public.targets (type, zone, unit, target)
SELECT 
    'zone', 
    r.zone, 
    NULL, 
    COALESCE(NULLIF(regexp_replace(r.phone, '[^0-9]', '', 'g'), '')::INTEGER, 0)
FROM public.registrations r
WHERE r.reg_id ILIKE 'SYS_TARGET_zone_%'
  AND NOT EXISTS (
    SELECT 1 FROM public.targets t 
    WHERE (UPPER(t.zone) = UPPER(r.zone) OR UPPER(t.zone) = UPPER(r.name) OR UPPER(t.zone) = UPPER(r.zone || ' ZONE'))
  );

-- 2c. Migrate Unit Targets (Each unit under its zone)
DELETE FROM public.targets WHERE type = 'unit';
INSERT INTO public.targets (type, zone, unit, target)
SELECT 
    'unit', 
    zone, 
    unit, 
    COALESCE(NULLIF(regexp_replace(phone, '[^0-9]', '', 'g'), '')::INTEGER, 0)
FROM public.registrations
WHERE reg_id ILIKE 'SYS_TARGET_unit_%';

-- 2d. Clean up legacy dummy SYS_TARGET_ rows from registrations table
DELETE FROM public.registrations
WHERE reg_id ILIKE 'SYS_TARGET_%';

-- ------------------------------------------------------------------------------
-- 3. MAPPING & ACCOUNTS POLICIES (Enables managing mappings & admin accounts)
-- ------------------------------------------------------------------------------
ALTER TABLE public.mapping ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on mapping" ON public.mapping;
    CREATE POLICY "Allow anon all on mapping" ON public.mapping FOR ALL TO anon USING (true) WITH CHECK (true);
END $$;

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on accounts" ON public.accounts;
    CREATE POLICY "Allow anon all on accounts" ON public.accounts FOR ALL TO anon USING (true) WITH CHECK (true);
END $$;

-- ------------------------------------------------------------------------------
-- 4. MEDIA & SETTINGS POLICIES
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
-- VERIFICATION
-- ------------------------------------------------------------------------------
SELECT 'vehicles' AS table_name, count(*)::text AS row_count FROM public.vehicles
UNION ALL
SELECT 'targets', count(*)::text FROM public.targets
UNION ALL
SELECT 'registrations (delegates only)', count(*)::text FROM public.registrations;
