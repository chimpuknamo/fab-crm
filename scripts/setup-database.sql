-- FabriiQ Marketing Website Database Setup
-- Minimal setup for website admin and AI chat document management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- User Profiles Table (Simplified for website admin only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin')) DEFAULT 'admin',
    avatar_url TEXT,
    preferences JSONB DEFAULT '{"notifications": true, "theme": "light", "language": "en"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on user_id and email
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_idx ON user_profiles(email);

-- ============================================================================
-- Documents Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'web', 'manual')) DEFAULT 'upload',
    file_size INTEGER,
    file_type TEXT DEFAULT 'text/plain',
    processing_status TEXT NOT NULL CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS documents_processing_status_idx ON documents(processing_status);
CREATE INDEX IF NOT EXISTS documents_source_type_idx ON documents(source_type);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at DESC);

-- ============================================================================
-- Document Chunks Table (for vector search)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    embedding vector(384), -- For gte-small model
    metadata JSONB DEFAULT '{}'::jsonb,
    token_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for vector search
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- AI Analytics Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS ai_analytics_event_type_idx ON ai_analytics(event_type);
CREATE INDEX IF NOT EXISTS ai_analytics_created_at_idx ON ai_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_analytics_user_id_idx ON ai_analytics(user_id);

-- ============================================================================
-- AI Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default AI settings
INSERT INTO ai_settings (setting_key, setting_value, description) VALUES
    ('embedding_model', '"Supabase/gte-small"', 'The embedding model to use for document processing'),
    ('chunk_size', '500', 'Default chunk size for document processing'),
    ('chunk_overlap', '50', 'Overlap between chunks in tokens'),
    ('similarity_threshold', '0.7', 'Minimum similarity threshold for vector search'),
    ('max_chunks_per_query', '5', 'Maximum number of chunks to return per search query')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Service role can manage user profiles" ON user_profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Documents Policies
CREATE POLICY "Anyone can view completed documents" ON documents
    FOR SELECT USING (processing_status = 'completed');

CREATE POLICY "Admins can manage all documents" ON documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Service role can manage documents" ON documents
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Document Chunks Policies
CREATE POLICY "Anyone can search document chunks" ON document_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE id = document_chunks.document_id 
            AND processing_status = 'completed'
        )
    );

CREATE POLICY "Admins can manage document chunks" ON document_chunks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Service role can manage document chunks" ON document_chunks
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- AI Analytics Policies
CREATE POLICY "Users can insert their own analytics" ON ai_analytics
    FOR INSERT WITH CHECK (
        user_id IS NULL OR user_id = auth.uid()
    );

CREATE POLICY "Admins can view all analytics" ON ai_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Service role can manage analytics" ON ai_analytics
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- AI Settings Policies
CREATE POLICY "Anyone can view active settings" ON ai_settings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage settings" ON ai_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Service role can manage settings" ON ai_settings
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_settings_updated_at ON ai_settings;
CREATE TRIGGER update_ai_settings_updated_at
    BEFORE UPDATE ON ai_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(384),
    similarity_threshold float,
    match_count int
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        document_chunks.id,
        document_chunks.document_id,
        document_chunks.content,
        1 - (document_chunks.embedding <=> query_embedding) AS similarity
    FROM document_chunks
    JOIN documents ON documents.id = document_chunks.document_id
    WHERE 1 - (document_chunks.embedding <=> query_embedding) > similarity_threshold
    AND documents.processing_status = 'completed'
    ORDER BY document_chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

COMMENT ON TABLE user_profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE documents IS 'Documents uploaded to the knowledge base';
COMMENT ON TABLE document_chunks IS 'Chunked documents with vector embeddings for semantic search';
COMMENT ON TABLE ai_analytics IS 'Analytics and logging for AI operations';
COMMENT ON TABLE ai_settings IS 'Configuration settings for AI operations';

COMMENT ON FUNCTION match_documents IS 'Semantic search function for finding similar document chunks';