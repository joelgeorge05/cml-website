-- ==============================================================================
-- PHASE 5: SUPABASE OPTIMIZATIONS
-- ==============================================================================
-- This script safely applies indexes and RPC functions to optimize the CML website.
-- It is idempotent (safe to run multiple times).

-- ==============================================================================
-- 1. SUPPORTING INDEXES
-- ==============================================================================
-- These indexes speed up the most common queries across the application,
-- especially where sorting by `created_at` or filtering by `competition` is used.

CREATE INDEX IF NOT EXISTS idx_results_competition_published 
  ON public.results(competition, is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_results_unit_id 
  ON public.results(unit_id);

CREATE INDEX IF NOT EXISTS idx_registrations_competition 
  ON public.registrations(competition, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_images_album 
  ON public.gallery_images(album_id);

CREATE INDEX IF NOT EXISTS idx_announcements_date 
  ON public.announcements(date DESC);


-- ==============================================================================
-- 2. LEADERBOARD RPC FUNCTION
-- ==============================================================================
-- FUNCTION: get_competition_leaderboard
-- PURPOSE: Moves the heavy Kalolsavam and Sahithyamalsaram leaderboard logic
--          from the browser (App.tsx / KalolsavamView.tsx) to Postgres.
-- REPLACES: Client-side `results.filter` and substring-based unit mapping.
-- HOW IT WORKS: 
-- 1. Grabs all official units from the `units` table.
-- 2. Matches `results` to units using direct ID matches, legacy hardcoded anomalies,
--    and fuzzy substring matching (ignoring words like 'church', 'st.', 'marys').
-- 3. Aggregates total_points, a_grades_count, first_positions_count, etc.
-- 4. Ranks them using exact tie-breaking logic from the frontend.

CREATE OR REPLACE FUNCTION public.get_competition_leaderboard(p_competition text)
RETURNS TABLE (
    unit_id text,
    unit_name text,
    total_points bigint,
    participants_count bigint,
    a_grades_count bigint,
    first_positions_count bigint,
    second_positions_count bigint,
    rank bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH official_units AS (
        SELECT 
            id, 
            name, 
            lower(trim(id)) as s_id, 
            lower(trim(name)) as s_name
        FROM public.units
    ),
    mapped_results AS (
        SELECT 
            r.id,
            COALESCE(r.total_points, 0) as total_points,
            r.grade,
            r.position,
            (
                SELECT u.id
                FROM official_units u
                WHERE 
                    -- 1. Direct match with official ID
                    lower(trim(r.unit_id)) = u.s_id OR
                    -- 2. Direct match with database ID (legacy anomalies mapped to canonical unit ids)
                    (u.s_id = 'kyr01' AND lower(trim(r.unit_id)) = 'unit-1') OR
                    (u.s_id = 'kyr13' AND lower(trim(r.unit_id)) = 'unit-2') OR
                    (u.s_id = 'kyr03' AND lower(trim(r.unit_id)) = 'unit-3') OR
                    (u.s_id = 'kyr12' AND lower(trim(r.unit_id)) = 'unit-5') OR
                    -- 3. Name substring matching
                    (r.unit_name IS NOT NULL AND lower(trim(r.unit_name)) LIKE '%' || u.s_name || '%') OR
                    -- 4. Clean name comparison as fallback (mirrors the frontend's cleanName() function)
                    (
                        r.unit_name IS NOT NULL AND 
                        (
                            trim(regexp_replace(lower(r.unit_name), '(church|st\.|marys|mary''s|sebastian|sebastians|augustine|augustines|george|georges|thomas|thomass|joseph|josephs|alphonsa|mother|little|flower|shakha|,|\s+)', '', 'g')) 
                            LIKE '%' || trim(regexp_replace(lower(u.name), '(church|st\.|marys|mary''s|sebastian|sebastians|augustine|augustines|george|georges|thomas|thomass|joseph|josephs|alphonsa|mother|little|flower|shakha|,|\s+)', '', 'g')) || '%'
                            OR
                            trim(regexp_replace(lower(u.name), '(church|st\.|marys|mary''s|sebastian|sebastians|augustine|augustines|george|georges|thomas|thomass|joseph|josephs|alphonsa|mother|little|flower|shakha|,|\s+)', '', 'g'))
                            LIKE '%' || trim(regexp_replace(lower(r.unit_name), '(church|st\.|marys|mary''s|sebastian|sebastians|augustine|augustines|george|georges|thomas|thomass|joseph|josephs|alphonsa|mother|little|flower|shakha|,|\s+)', '', 'g')) || '%'
                        )
                    )
                LIMIT 1
            ) as mapped_unit_id
        FROM public.results r
        WHERE r.is_published = true 
          AND (p_competition = 'Overall' OR r.competition = p_competition)
    ),
    summary AS (
        SELECT 
            u.id as unit_id,
            u.name as unit_name,
            SUM(mr.total_points) as total_points,
            COUNT(mr.id) as participants_count,
            COUNT(mr.id) FILTER (WHERE mr.grade = 'A') as a_grades_count,
            COUNT(mr.id) FILTER (WHERE mr.position = '1st') as first_positions_count,
            COUNT(mr.id) FILTER (WHERE mr.position = '2nd') as second_positions_count
        FROM official_units u
        LEFT JOIN mapped_results mr ON mr.mapped_unit_id = u.id
        GROUP BY u.id, u.name
    )
    SELECT 
        s.unit_id,
        s.unit_name,
        COALESCE(s.total_points, 0)::bigint,
        s.participants_count::bigint,
        s.a_grades_count::bigint,
        s.first_positions_count::bigint,
        s.second_positions_count::bigint,
        RANK() OVER (
            ORDER BY 
                COALESCE(s.total_points, 0) DESC,
                s.a_grades_count DESC,
                s.first_positions_count DESC,
                s.second_positions_count DESC,
                s.participants_count DESC
        ) as rank
    FROM summary s
    ORDER BY rank ASC;
END;
$$;
