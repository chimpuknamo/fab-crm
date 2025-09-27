-- AIVY Conversation Memory and Session Management
-- Enhanced conversation tracking for executive-level interactions

-- Enhanced conversation sessions with executive profiling
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_identifier TEXT UNIQUE NOT NULL, -- For anonymous users
  executive_profile JSONB DEFAULT '{}'::jsonb,
  conversation_state JSONB DEFAULT '{
    "engagementLevel": "initial",
    "discussedTopics": [],
    "expressedChallenges": [],
    "decisionCriteria": [],
    "institutionContext": {}
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced conversation turns with intent analysis
CREATE TABLE IF NOT EXISTS conversation_turns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  user_query TEXT NOT NULL,
  intent_analysis JSONB DEFAULT '{}'::jsonb,
  response_content TEXT NOT NULL,
  knowledge_sources JSONB DEFAULT '[]'::jsonb,
  response_metrics JSONB DEFAULT '{
    "wordCount": 0,
    "executiveAppropriate": 0,
    "conversationalFlow": 0,
    "actionOriented": 0,
    "strategicInsight": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS conversation_sessions_session_identifier_idx ON conversation_sessions(session_identifier);
CREATE INDEX IF NOT EXISTS conversation_sessions_user_id_idx ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS conversation_sessions_updated_at_idx ON conversation_sessions(updated_at);
CREATE INDEX IF NOT EXISTS conversation_turns_session_id_idx ON conversation_turns(session_id);
CREATE INDEX IF NOT EXISTS conversation_turns_created_at_idx ON conversation_turns(created_at);

-- Update trigger for conversation sessions
CREATE OR REPLACE FUNCTION update_conversation_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_interaction_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_sessions_updated_at 
    BEFORE UPDATE ON conversation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_conversation_session_timestamp();

-- Function to get or create conversation session
CREATE OR REPLACE FUNCTION get_or_create_conversation_session(
  p_session_identifier TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  session_id UUID;
  processed_user_id UUID;
BEGIN
  -- Handle user_id parameter (convert non-UUID strings to NULL for anonymous users)
  BEGIN
    processed_user_id := p_user_id;
  EXCEPTION WHEN others THEN
    processed_user_id := NULL;
  END;
  
  -- Try to find existing session
  SELECT id INTO session_id 
  FROM conversation_sessions 
  WHERE session_identifier = p_session_identifier;
  
  -- Create new session if not found
  IF session_id IS NULL THEN
    INSERT INTO conversation_sessions (session_identifier, user_id)
    VALUES (p_session_identifier, processed_user_id)
    RETURNING id INTO session_id;
  ELSE
    -- Update last interaction time
    UPDATE conversation_sessions 
    SET last_interaction_at = NOW() 
    WHERE id = session_id;
  END IF;
  
  RETURN session_id;
END;
$$;

-- Function to update executive profile based on conversation
CREATE OR REPLACE FUNCTION update_executive_profile(
  p_session_id UUID,
  p_profile_updates JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversation_sessions 
  SET 
    executive_profile = executive_profile || p_profile_updates,
    updated_at = NOW()
  WHERE id = p_session_id;
END;
$$;

-- Function to get conversation history for context
CREATE OR REPLACE FUNCTION get_conversation_history(
  p_session_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  turn_id UUID,
  user_query TEXT,
  response_content TEXT,
  intent_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.user_query,
    ct.response_content,
    ct.intent_analysis,
    ct.created_at
  FROM conversation_turns ct
  WHERE ct.session_id = p_session_id
  ORDER BY ct.created_at DESC
  LIMIT p_limit;
END;
$$;