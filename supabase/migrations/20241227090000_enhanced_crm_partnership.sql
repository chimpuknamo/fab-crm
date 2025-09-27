-- Enhanced CRM System with Partnership Co-Creation Assessment
-- Comprehensive contact profiles, lead scoring, and partnership evaluation

-- Enhanced lead_contacts table with CRM and partnership fields
ALTER TABLE lead_contacts 
ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'qualified', 'opportunity', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website_chat',
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS annual_revenue TEXT,
ADD COLUMN IF NOT EXISTS decision_timeline TEXT,
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS pain_points TEXT[],
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_follow_up TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'education',
ADD COLUMN IF NOT EXISTS job_function TEXT;

-- Partnership assessments table
CREATE TABLE IF NOT EXISTS partnership_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES lead_contacts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE SET NULL,
  
  -- Institution Information
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN (
    'public_university', 'private_university', 'community_college', 
    'k12_district', 'charter_school', 'international_school', 
    'vocational_institute', 'other'
  )),
  campus_count INTEGER DEFAULT 1,
  student_population INTEGER,
  
  -- Strategic Contact Information (primary contact details in lead_contacts)
  primary_contact_name TEXT NOT NULL,
  primary_contact_email TEXT NOT NULL,
  primary_contact_phone TEXT,
  primary_contact_role TEXT NOT NULL,
  
  -- Co-Development Partnership Details
  current_tech_ecosystem TEXT NOT NULL, -- Detailed description
  strategic_challenges TEXT NOT NULL,   -- Challenges and goals
  investment_timeline TEXT NOT NULL CHECK (investment_timeline IN (
    'immediate_0_3_months', 'short_term_3_6_months', 'medium_term_6_12_months', 
    'long_term_1_2_years', 'strategic_2_plus_years'
  )),
  partnership_commitment_level TEXT NOT NULL CHECK (partnership_commitment_level IN (
    'exploration', 'pilot_program', 'partial_implementation', 
    'full_implementation', 'strategic_partnership', 'co_development'
  )),
  
  -- Custom Requirements & Vision
  custom_requirements TEXT,
  vision_statement TEXT,
  
  -- Assessment Metadata
  assessment_score DECIMAL(5,2) DEFAULT 0.0,
  readiness_level TEXT DEFAULT 'initial' CHECK (readiness_level IN (
    'initial', 'exploring', 'evaluating', 'ready', 'committed'
  )),
  partnership_priority TEXT DEFAULT 'medium' CHECK (partnership_priority IN (
    'low', 'medium', 'high', 'critical'
  )),
  
  -- Tracking
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_review', 'approved', 'declined', 'follow_up_needed'
  )),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact interactions tracking
CREATE TABLE IF NOT EXISTS contact_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES lead_contacts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('chat', 'email', 'call', 'demo', 'meeting', 'follow_up', 'assessment_submitted')),
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  outcome TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  topics_discussed TEXT[],
  action_items TEXT[],
  next_steps TEXT,
  interaction_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation analytics
CREATE TABLE IF NOT EXISTS conversation_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES lead_contacts(id) ON DELETE SET NULL,
  total_messages INTEGER DEFAULT 0,
  conversation_duration_minutes INTEGER DEFAULT 0,
  user_engagement_score DECIMAL(3,2) DEFAULT 0.0,
  intent_distribution JSONB DEFAULT '{}'::jsonb,
  topics_covered TEXT[],
  pain_points_mentioned TEXT[],
  buying_signals INTEGER DEFAULT 0,
  objections_raised TEXT[],
  competitive_mentions TEXT[],
  demo_requested BOOLEAN DEFAULT FALSE,
  contact_info_provided BOOLEAN DEFAULT FALSE,
  meeting_requested BOOLEAN DEFAULT FALSE,
  pricing_discussed BOOLEAN DEFAULT FALSE,
  partnership_assessment_completed BOOLEAN DEFAULT FALSE,
  technical_questions INTEGER DEFAULT 0,
  business_questions INTEGER DEFAULT 0,
  satisfaction_indicators JSONB DEFAULT '{}'::jsonb,
  conversion_stage TEXT DEFAULT 'awareness' CHECK (conversion_stage IN (
    'awareness', 'interest', 'consideration', 'evaluation', 'decision', 'partnership'
  )),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead scoring rules with partnership assessment factors
CREATE TABLE IF NOT EXISTS lead_scoring_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('demographic', 'behavioral', 'engagement', 'conversation', 'partnership')),
  condition_field TEXT NOT NULL,
  condition_operator TEXT NOT NULL CHECK (condition_operator IN ('equals', 'contains', 'greater_than', 'less_than', 'in_list')),
  condition_value TEXT NOT NULL,
  score_points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact tags for categorization
CREATE TABLE IF NOT EXISTS contact_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES lead_contacts(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, tag_name)
);

-- Follow-up tasks
CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES lead_contacts(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('call', 'email', 'demo', 'meeting', 'proposal', 'follow_up', 'partnership_review')),
  task_title TEXT NOT NULL,
  task_description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID,
  created_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS partnership_assessments_contact_id_idx ON partnership_assessments(contact_id);
CREATE INDEX IF NOT EXISTS partnership_assessments_institution_type_idx ON partnership_assessments(institution_type);
CREATE INDEX IF NOT EXISTS partnership_assessments_readiness_level_idx ON partnership_assessments(readiness_level);
CREATE INDEX IF NOT EXISTS partnership_assessments_partnership_priority_idx ON partnership_assessments(partnership_priority);
CREATE INDEX IF NOT EXISTS partnership_assessments_submitted_at_idx ON partnership_assessments(submitted_at);
CREATE INDEX IF NOT EXISTS contact_interactions_contact_id_idx ON contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS contact_interactions_interaction_date_idx ON contact_interactions(interaction_date);
CREATE INDEX IF NOT EXISTS conversation_analytics_session_id_idx ON conversation_analytics(session_id);
CREATE INDEX IF NOT EXISTS conversation_analytics_contact_id_idx ON conversation_analytics(contact_id);
CREATE INDEX IF NOT EXISTS lead_contacts_lead_status_idx ON lead_contacts(lead_status);
CREATE INDEX IF NOT EXISTS lead_contacts_lead_score_idx ON lead_contacts(lead_score);

-- Insert enhanced lead scoring rules including partnership assessment
INSERT INTO lead_scoring_rules (rule_name, rule_type, condition_field, condition_operator, condition_value, score_points) VALUES
('Executive Role', 'demographic', 'role', 'contains', 'president,ceo,chancellor,dean,director,vp', 25),
('Large Institution', 'demographic', 'company_size', 'equals', 'large', 20),
('University Level', 'partnership', 'institution_type', 'contains', 'university', 15),
('Multi-Campus', 'partnership', 'campus_count', 'greater_than', '1', 20),
('Large Student Population', 'partnership', 'student_population', 'greater_than', '5000', 15),
('Strategic Partnership Interest', 'partnership', 'partnership_commitment_level', 'contains', 'strategic_partnership,co_development', 40),
('Full Implementation Ready', 'partnership', 'partnership_commitment_level', 'equals', 'full_implementation', 30),
('Immediate Timeline', 'partnership', 'investment_timeline', 'contains', 'immediate,short_term', 25),
('Assessment Completed', 'behavioral', 'partnership_assessment_completed', 'equals', 'true', 35),
('Demo Requested', 'behavioral', 'demo_requested', 'equals', 'true', 30),
('Meeting Requested', 'behavioral', 'meeting_requested', 'equals', 'true', 25),
('High Engagement', 'engagement', 'user_engagement_score', 'greater_than', '0.7', 15),
('Long Conversation', 'engagement', 'total_messages', 'greater_than', '10', 10)
ON CONFLICT DO NOTHING;

-- Function to calculate partnership assessment score
CREATE OR REPLACE FUNCTION calculate_partnership_score(p_assessment_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  assessment_record RECORD;
  score DECIMAL := 0.0;
BEGIN
  SELECT * INTO assessment_record FROM partnership_assessments WHERE id = p_assessment_id;
  
  IF assessment_record IS NULL THEN
    RETURN 0.0;
  END IF;
  
  -- Institution size scoring
  CASE assessment_record.institution_type
    WHEN 'public_university', 'private_university' THEN score := score + 20;
    WHEN 'community_college' THEN score := score + 15;
    WHEN 'k12_district' THEN score := score + 10;
    ELSE score := score + 5;
  END CASE;
  
  -- Campus count scoring
  IF assessment_record.campus_count > 5 THEN score := score + 25;
  ELSIF assessment_record.campus_count > 1 THEN score := score + 15;
  ELSE score := score + 5;
  END IF;
  
  -- Student population scoring
  IF assessment_record.student_population > 20000 THEN score := score + 20;
  ELSIF assessment_record.student_population > 5000 THEN score := score + 15;
  ELSIF assessment_record.student_population > 1000 THEN score := score + 10;
  ELSE score := score + 5;
  END IF;
  
  -- Timeline scoring (urgency)
  CASE assessment_record.investment_timeline
    WHEN 'immediate_0_3_months' THEN score := score + 25;
    WHEN 'short_term_3_6_months' THEN score := score + 20;
    WHEN 'medium_term_6_12_months' THEN score := score + 15;
    WHEN 'long_term_1_2_years' THEN score := score + 10;
    ELSE score := score + 5;
  END CASE;
  
  -- Commitment level scoring
  CASE assessment_record.partnership_commitment_level
    WHEN 'co_development' THEN score := score + 30;
    WHEN 'strategic_partnership' THEN score := score + 25;
    WHEN 'full_implementation' THEN score := score + 20;
    WHEN 'partial_implementation' THEN score := score + 15;
    WHEN 'pilot_program' THEN score := score + 10;
    ELSE score := score + 5;
  END CASE;
  
  -- Update the assessment score
  UPDATE partnership_assessments SET assessment_score = score WHERE id = p_assessment_id;
  
  RETURN score;
END;
$$;

-- Function to create partnership assessment
CREATE OR REPLACE FUNCTION create_partnership_assessment(
  p_contact_id UUID,
  p_session_id UUID,
  p_assessment_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  assessment_id UUID;
  calculated_score DECIMAL;
BEGIN
  -- Insert partnership assessment
  INSERT INTO partnership_assessments (
    contact_id, session_id, institution_name, institution_type, campus_count,
    student_population, primary_contact_name, primary_contact_email,
    primary_contact_phone, primary_contact_role, current_tech_ecosystem,
    strategic_challenges, investment_timeline, partnership_commitment_level,
    custom_requirements, vision_statement
  )
  VALUES (
    p_contact_id, p_session_id,
    (p_assessment_data->>'institution_name'),
    (p_assessment_data->>'institution_type'),
    (p_assessment_data->>'campus_count')::INTEGER,
    (p_assessment_data->>'student_population')::INTEGER,
    (p_assessment_data->>'primary_contact_name'),
    (p_assessment_data->>'primary_contact_email'),
    (p_assessment_data->>'primary_contact_phone'),
    (p_assessment_data->>'primary_contact_role'),
    (p_assessment_data->>'current_tech_ecosystem'),
    (p_assessment_data->>'strategic_challenges'),
    (p_assessment_data->>'investment_timeline'),
    (p_assessment_data->>'partnership_commitment_level'),
    (p_assessment_data->>'custom_requirements'),
    (p_assessment_data->>'vision_statement')
  )
  RETURNING id INTO assessment_id;
  
  -- Calculate assessment score
  calculated_score := calculate_partnership_score(assessment_id);
  
  -- Update conversation analytics
  UPDATE conversation_analytics 
  SET partnership_assessment_completed = TRUE,
      conversion_stage = 'evaluation',
      last_updated = NOW()
  WHERE session_id = p_session_id;
  
  -- Add interaction record
  INSERT INTO contact_interactions (
    contact_id, session_id, interaction_type, outcome, interaction_score, metadata
  )
  VALUES (
    p_contact_id, p_session_id, 'assessment_submitted', 
    'Partnership assessment completed', calculated_score::INTEGER,
    jsonb_build_object('assessment_id', assessment_id, 'score', calculated_score)
  );
  
  -- Recalculate lead score
  PERFORM calculate_lead_score(p_contact_id);
  
  RETURN assessment_id;
END;
$$;

-- Function to calculate lead score (enhanced)
CREATE OR REPLACE FUNCTION calculate_lead_score(p_contact_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_score INTEGER := 0;
  rule_record RECORD;
  contact_record RECORD;
  analytics_record RECORD;
  assessment_record RECORD;
BEGIN
  -- Get contact, analytics, and assessment data
  SELECT * INTO contact_record FROM lead_contacts WHERE id = p_contact_id;
  SELECT * INTO analytics_record FROM conversation_analytics WHERE contact_id = p_contact_id;
  SELECT * INTO assessment_record FROM partnership_assessments WHERE contact_id = p_contact_id ORDER BY submitted_at DESC LIMIT 1;
  
  IF contact_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Apply scoring rules
  FOR rule_record IN SELECT * FROM lead_scoring_rules WHERE is_active = TRUE
  LOOP
    CASE rule_record.rule_type
      WHEN 'demographic' THEN
        CASE rule_record.condition_field
          WHEN 'role' THEN
            IF rule_record.condition_operator = 'contains' AND 
               contact_record.role IS NOT NULL AND
               contact_record.role ILIKE ANY(string_to_array(rule_record.condition_value, ','))
            THEN
              total_score := total_score + rule_record.score_points;
            END IF;
        END CASE;
      WHEN 'partnership' THEN
        IF assessment_record IS NOT NULL THEN
          CASE rule_record.condition_field
            WHEN 'institution_type' THEN
              IF rule_record.condition_operator = 'contains' AND 
                 assessment_record.institution_type ILIKE ANY(string_to_array(rule_record.condition_value, ','))
              THEN
                total_score := total_score + rule_record.score_points;
              END IF;
            WHEN 'campus_count' THEN
              IF rule_record.condition_operator = 'greater_than' AND 
                 assessment_record.campus_count > rule_record.condition_value::INTEGER
              THEN
                total_score := total_score + rule_record.score_points;
              END IF;
            WHEN 'student_population' THEN
              IF rule_record.condition_operator = 'greater_than' AND 
                 assessment_record.student_population > rule_record.condition_value::INTEGER
              THEN
                total_score := total_score + rule_record.score_points;
              END IF;
          END CASE;
        END IF;
      WHEN 'behavioral' THEN
        IF analytics_record IS NOT NULL THEN
          CASE rule_record.condition_field
            WHEN 'partnership_assessment_completed' THEN
              IF rule_record.condition_operator = 'equals' AND 
                 analytics_record.partnership_assessment_completed::text = rule_record.condition_value
              THEN
                total_score := total_score + rule_record.score_points;
              END IF;
            WHEN 'demo_requested' THEN
              IF rule_record.condition_operator = 'equals' AND 
                 analytics_record.demo_requested::text = rule_record.condition_value
              THEN
                total_score := total_score + rule_record.score_points;
              END IF;
          END CASE;
        END IF;
    END CASE;
  END LOOP;
  
  -- Update the lead score
  UPDATE lead_contacts SET lead_score = total_score WHERE id = p_contact_id;
  
  RETURN total_score;
END;
$$;