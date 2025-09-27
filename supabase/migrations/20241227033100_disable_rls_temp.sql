-- Temporarily disable RLS for document upload
-- WARNING: This is for development only - should be re-enabled in production

ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics DISABLE ROW LEVEL SECURITY;