-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- Storage policies for documents bucket
-- Allow authenticated users to view documents (needed for processing)
CREATE POLICY "Authenticated users can view documents" ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Only admins can upload documents
CREATE POLICY "Admins can upload documents" ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'documents' AND (
      auth.jwt() ->> 'role' = 'admin' OR 
      auth.jwt() ->> 'user_role' = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents" ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'documents' AND (
      auth.jwt() ->> 'role' = 'admin' OR 
      auth.jwt() ->> 'user_role' = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Service role can access all operations (needed for processing)
CREATE POLICY "Service role can access documents" ON storage.objects 
  FOR ALL 
  USING (bucket_id = 'documents' AND auth.jwt() ->> 'role' = 'service_role');