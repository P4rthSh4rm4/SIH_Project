-- Fix: Allow Academicians (and potentially others) to read industry user profiles.
-- The existing policy only allows reading `role = 'student'`.
-- Without this, fetching `industry:users(name)` returns null for Academicians.

DROP POLICY IF EXISTS "Users can read industry profiles" ON public.users;
CREATE POLICY "Users can read industry profiles" ON public.users
    FOR SELECT
    USING (role = 'industry');
