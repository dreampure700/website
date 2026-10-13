-- ==============================================================================
-- TEENSPACE 2026: DUAL REGISTRATION IDS (DISTRICT ID & ZONE ID) SETUP SCRIPT
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Add dedicated columns to public.registrations
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS district_id TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS zone_id TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_registrations_district_id ON public.registrations(district_id);
CREATE INDEX IF NOT EXISTS idx_registrations_zone_id ON public.registrations(zone_id);

-- 3. Calculate and assign sequential District IDs and Zone IDs strictly ordered by registration timestamp
WITH numbered_delegates AS (
    SELECT 
        id,
        -- District ID starts sequentially from REG101 across all delegates
        'REG' || (100 + ROW_NUMBER() OVER (ORDER BY timestamp ASC, id ASC)) AS calculated_district_id,
        -- Zone ID starts from 101 with respective Zone Code (e.g. KPM101, CKD101, GVR101, etc.)
        (
            CASE 
                WHEN UPPER(COALESCE(zone, '')) LIKE '%CHAVAKKAD%' THEN 'CKD'
                WHEN UPPER(COALESCE(zone, '')) LIKE '%KAIPAMANGALAM%' THEN 'KPM'
                WHEN UPPER(COALESCE(zone, '')) LIKE '%PAVARATTY%' THEN 'PVT'
                WHEN UPPER(COALESCE(zone, '')) LIKE '%THRISSUR%' THEN 'TSR'
                WHEN UPPER(COALESCE(zone, '')) LIKE '%KODUNGALL%' THEN 'KDR'
                WHEN UPPER(COALESCE(zone, '')) LIKE '%GURUVAY%' THEN 'GVR'
                WHEN UPPER(COALESCE(zone, '')) LIKE '%KUNNAMKULAM%' THEN 'KNM'
                ELSE 'REG'
            END
        ) || (
            100 + ROW_NUMBER() OVER (
                PARTITION BY (
                    CASE 
                        WHEN UPPER(COALESCE(zone, '')) LIKE '%CHAVAKKAD%' THEN 'CKD'
                        WHEN UPPER(COALESCE(zone, '')) LIKE '%KAIPAMANGALAM%' THEN 'KPM'
                        WHEN UPPER(COALESCE(zone, '')) LIKE '%PAVARATTY%' THEN 'PVT'
                        WHEN UPPER(COALESCE(zone, '')) LIKE '%THRISSUR%' THEN 'TSR'
                        WHEN UPPER(COALESCE(zone, '')) LIKE '%KODUNGALL%' THEN 'KDR'
                        WHEN UPPER(COALESCE(zone, '')) LIKE '%GURUVAY%' THEN 'GVR'
                        WHEN UPPER(COALESCE(zone, '')) LIKE '%KUNNAMKULAM%' THEN 'KNM'
                        ELSE 'REG'
                    END
                ) 
                ORDER BY timestamp ASC, id ASC
            )
        ) AS calculated_zone_id
    FROM public.registrations
    WHERE reg_id NOT ILIKE 'SYS_%'
)
UPDATE public.registrations r
SET 
    district_id = n.calculated_district_id,
    zone_id = n.calculated_zone_id
FROM numbered_delegates n
WHERE r.id = n.id;

-- 4. Clean up any remaining legacy status records
UPDATE public.registrations r
SET status = s.name
FROM public.registrations s
WHERE s.reg_id = 'SYS_STATUS_' || r.reg_id;

DELETE FROM public.registrations WHERE reg_id ILIKE 'SYS_%';

-- 5. Verification: View sample delegates with both IDs
SELECT 
    district_id, 
    zone_id, 
    name, 
    zone, 
    unit, 
    phone, 
    timestamp
FROM public.registrations
ORDER BY timestamp ASC, id ASC
LIMIT 15;
