-- Manual Admin User Creation Script
-- Run this in your Supabase SQL Editor when API keys are not available
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/uwtglbvmueyfwqsldykg
-- 2. Navigate to SQL Editor
-- 3. Run this script
-- 4. Then manually create the user in Authentication > Users
-- 5. Update the user_id in the second part of this script

-- First, let's check if the user_profiles table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';

-- Create admin user profile (you'll need to replace USER_ID_HERE with actual user ID after creating user)
-- Step 1: Create user in Auth (do this manually in dashboard first)
-- Step 2: Then run this insert with the actual user ID

/*
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users after manual creation
INSERT INTO user_profiles (user_id, full_name, role, is_active)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'Admin User',    -- Replace with actual name
  'admin',         -- This gives admin privileges
  true
);
*/

-- Verify the admin user was created
-- SELECT * FROM user_profiles WHERE role = 'admin';

-- Alternative approach: Update existing user to admin
-- If you already have a user account, you can promote them to admin:
-- UPDATE user_profiles SET role = 'admin' WHERE user_id = 'USER_ID_HERE';

-- Check all users and their roles
-- SELECT 
--   up.id,
--   up.user_id, 
--   up.full_name,
--   up.role,
--   up.is_active,
--   au.email,
--   au.created_at
-- FROM user_profiles up
-- JOIN auth.users au ON up.user_id = au.id;