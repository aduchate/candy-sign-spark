
-- Restrict content tables to admin-only writes

-- alphabet_signs
DROP POLICY IF EXISTS "Authenticated users can insert alphabet signs" ON public.alphabet_signs;
DROP POLICY IF EXISTS "Authenticated users can update alphabet signs" ON public.alphabet_signs;
CREATE POLICY "Admins can insert alphabet signs" ON public.alphabet_signs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update alphabet signs" ON public.alphabet_signs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete alphabet signs" ON public.alphabet_signs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- word_categories
DROP POLICY IF EXISTS "Authenticated users can insert word categories" ON public.word_categories;
CREATE POLICY "Admins can insert word categories" ON public.word_categories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update word categories" ON public.word_categories FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete word categories" ON public.word_categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- word_sign_categories
DROP POLICY IF EXISTS "Authenticated users can insert word sign categories" ON public.word_sign_categories;
DROP POLICY IF EXISTS "Authenticated users can delete word sign categories" ON public.word_sign_categories;
CREATE POLICY "Admins can insert word sign categories" ON public.word_sign_categories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete word sign categories" ON public.word_sign_categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- word_signs
DROP POLICY IF EXISTS "Authenticated users can insert word signs" ON public.word_signs;
DROP POLICY IF EXISTS "Authenticated users can update word signs" ON public.word_signs;
CREATE POLICY "Admins can insert word signs" ON public.word_signs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update word signs" ON public.word_signs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete word signs" ON public.word_signs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- word_sign_variants
DROP POLICY IF EXISTS "Authenticated users can insert word sign variants" ON public.word_sign_variants;
DROP POLICY IF EXISTS "Authenticated users can update word sign variants" ON public.word_sign_variants;
CREATE POLICY "Admins can insert word sign variants" ON public.word_sign_variants FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update word sign variants" ON public.word_sign_variants FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete word sign variants" ON public.word_sign_variants FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- profiles: tighten UPDATE to authenticated only
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Storage: lsfb-videos UPDATE/DELETE restricted to admins; tighten INSERT to admins too
DROP POLICY IF EXISTS "Authenticated users can upload LSFB videos" ON storage.objects;
CREATE POLICY "Admins can upload LSFB videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lsfb-videos' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update LSFB videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lsfb-videos' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete LSFB videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'lsfb-videos' AND has_role(auth.uid(), 'admin'::app_role));

-- Lock down SECURITY DEFINER functions: revoke EXECUTE from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- keep EXECUTE for authenticated on has_role since RLS policies invoke it
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
