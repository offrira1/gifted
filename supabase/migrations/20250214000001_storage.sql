-- Storage bucket for event cover and gift media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-media',
  'event-media',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated users can upload to event-media (folder by user/event)
-- Public can read (for displaying cover and gift media)
CREATE POLICY "Public read event-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-media');

CREATE POLICY "Authenticated upload event-media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-media'
    AND auth.role() = 'authenticated'
  );

-- Guests (anon) can upload gift media
CREATE POLICY "Anon insert event-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-media');

CREATE POLICY "Users update own event-media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own event-media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
