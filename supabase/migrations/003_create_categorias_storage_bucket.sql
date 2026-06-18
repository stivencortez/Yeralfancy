INSERT INTO storage.buckets (id, name, public)
VALUES ('categorias', 'categorias', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "anon_all_categorias_storage" ON storage.objects;
CREATE POLICY "anon_all_categorias_storage" ON storage.objects
  FOR ALL TO anon
  USING (bucket_id = 'categorias')
  WITH CHECK (bucket_id = 'categorias');
