-- Re-enable RLS for production security
-- This reverses the temporary disable_rls_temp.sql migration

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;

-- Ensure user_profiles also has RLS enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('documents', 'document_chunks', 'user_profiles', 'conversations', 'messages', 'ai_analytics');