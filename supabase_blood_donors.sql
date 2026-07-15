CREATE TABLE IF NOT EXISTS public.blood_donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    phone TEXT NOT NULL,
    parish TEXT NOT NULL,
    last_donated_date DATE,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_by_email TEXT
);

ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on blood_donors' AND tablename = 'blood_donors') THEN
        CREATE POLICY "Allow public read access on blood_donors" ON public.blood_donors FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated insert blood_donors' AND tablename = 'blood_donors') THEN
        CREATE POLICY "Allow authenticated insert blood_donors" ON public.blood_donors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated update blood_donors' AND tablename = 'blood_donors') THEN
        CREATE POLICY "Allow authenticated update blood_donors" ON public.blood_donors FOR UPDATE USING (
            auth.role() = 'authenticated' AND (
                (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Super Admin', 'Admin', 'Blood Donor Admin') 
                OR created_by_email = auth.jwt() ->> 'email'
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated delete blood_donors' AND tablename = 'blood_donors') THEN
        CREATE POLICY "Allow authenticated delete blood_donors" ON public.blood_donors FOR DELETE USING (
            auth.role() = 'authenticated' AND (
                (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Super Admin', 'Admin', 'Blood Donor Admin') 
                OR created_by_email = auth.jwt() ->> 'email'
            )
        );
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_blood_donors_blood_group ON public.blood_donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_donors_parish ON public.blood_donors(parish);
