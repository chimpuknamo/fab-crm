-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;

-- Documents policies
-- All authenticated users can view documents
CREATE POLICY "Authenticated users can view documents" ON documents 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only admins can manage documents
CREATE POLICY "Admins can insert documents" ON documents 
  FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update documents" ON documents 
  FOR UPDATE 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete documents" ON documents 
  FOR DELETE 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Document chunks policies
-- All authenticated users can view document chunks (needed for search)
CREATE POLICY "Authenticated users can view document chunks" ON document_chunks 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only admins and system can manage document chunks
CREATE POLICY "Admins can manage document chunks" ON document_chunks 
  FOR ALL 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Conversations policies
-- Users can only see their own conversations
CREATE POLICY "Users can view their own conversations" ON conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations" ON conversations 
  FOR SELECT 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Messages policies
-- Users can view messages from their own conversations
CREATE POLICY "Users can view messages from their conversations" ON messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can insert messages to their own conversations
CREATE POLICY "Users can insert messages to their conversations" ON messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Service role can insert messages (for AI responses)
CREATE POLICY "Service role can insert messages" ON messages 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON messages 
  FOR SELECT 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- AI Settings policies (admin only)
CREATE POLICY "Admins can view AI settings" ON ai_settings 
  FOR SELECT 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admins can manage AI settings" ON ai_settings 
  FOR ALL 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Analytics policies
-- Service role can insert analytics
CREATE POLICY "Service role can insert analytics" ON ai_analytics 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics" ON ai_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics" ON ai_analytics 
  FOR SELECT 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Create a function to check if user is admin (helper function)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;