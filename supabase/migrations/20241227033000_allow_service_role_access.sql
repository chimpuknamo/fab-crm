-- Allow service role to bypass RLS for document operations
-- This is needed for bulk document uploads and processing

-- Temporarily disable RLS on documents table for service operations
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Add policy to allow service role full access to documents
CREATE POLICY "service_role_documents_all" ON documents
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add policy to allow service role full access to document_chunks  
CREATE POLICY "service_role_chunks_all" ON document_chunks
  FOR ALL
  TO service_role
  USING (true) 
  WITH CHECK (true);

-- Allow authenticated users to read documents for AI chat
CREATE POLICY "authenticated_read_documents" ON documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to read document chunks for vector search
CREATE POLICY "authenticated_read_chunks" ON document_chunks
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow public read access for the AI chat interface (for guest users)
CREATE POLICY "public_read_documents" ON documents
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "public_read_chunks" ON document_chunks
  FOR SELECT
  TO anon
  USING (true);