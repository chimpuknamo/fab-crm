-- Lead Contacts Table for AIVY Executive Conversations
-- Stores contact information collected at conversation start

CREATE TABLE IF NOT EXISTS lead_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  organization TEXT,
  role TEXT,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add lead contact reference to conversation sessions
ALTER TABLE conversation_sessions 
ADD COLUMN IF NOT EXISTS lead_contact_id UUID REFERENCES lead_contacts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS contact_collected BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS lead_contacts_phone_idx ON lead_contacts(phone);
CREATE INDEX IF NOT EXISTS lead_contacts_collected_at_idx ON lead_contacts(collected_at);
CREATE INDEX IF NOT EXISTS lead_contacts_session_id_idx ON lead_contacts(session_id);
CREATE INDEX IF NOT EXISTS conversation_sessions_lead_contact_id_idx ON conversation_sessions(lead_contact_id);

-- Update trigger for lead_contacts
CREATE OR REPLACE FUNCTION update_lead_contacts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_contacts_updated_at 
    BEFORE UPDATE ON lead_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_lead_contacts_timestamp();

-- Function to create lead contact and link to session
CREATE OR REPLACE FUNCTION create_lead_contact(
  p_session_id UUID,
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT NULL,
  p_organization TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  contact_id UUID;
BEGIN
  -- Insert new lead contact
  INSERT INTO lead_contacts (name, phone, email, organization, role, session_id)
  VALUES (p_name, p_phone, p_email, p_organization, p_role, p_session_id)
  RETURNING id INTO contact_id;
  
  -- Update conversation session with lead contact reference
  UPDATE conversation_sessions 
  SET 
    lead_contact_id = contact_id,
    contact_collected = TRUE,
    updated_at = NOW()
  WHERE id = p_session_id;
  
  RETURN contact_id;
END;
$$;

-- Function to check if session has contact information
CREATE OR REPLACE FUNCTION session_has_contact_info(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  has_contact BOOLEAN DEFAULT FALSE;
BEGIN
  SELECT contact_collected INTO has_contact
  FROM conversation_sessions
  WHERE id = p_session_id;
  
  RETURN COALESCE(has_contact, FALSE);
END;
$$;