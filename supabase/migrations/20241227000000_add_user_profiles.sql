-- User profiles table to store additional user information
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX user_profiles_role_idx ON user_profiles(role);

-- RLS Policies for user_profiles
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own profile (except role field)
CREATE POLICY "Users can update their own profile" ON user_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id); -- Role changes will be restricted at application level

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND role = 'user'); -- Default to user role

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles 
  FOR SELECT 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON user_profiles 
  FOR UPDATE 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON user_profiles 
  FOR DELETE 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER create_profile_on_signup 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();