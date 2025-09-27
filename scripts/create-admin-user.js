#!/usr/bin/env node

/**
 * Admin User Creation Script for FabriiQ
 * 
 * This script creates an admin user with proper role assignment.
 * Run with: node scripts/create-admin-user.js
 * 
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('🚀 FabriiQ Admin User Creation\n');

    // Get user details
    const email = await askQuestion('📧 Admin email: ');
    const password = await askQuestion('🔒 Admin password (min 6 chars): ');
    const fullName = await askQuestion('👤 Full name: ');

    console.log('\n⏳ Creating admin user...');

    // Create user with admin role in metadata
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      user_metadata: {
        full_name: fullName.trim(),
        role: 'admin'
      },
      email_confirm: true // Auto-confirm email for admin users
    });

    if (authError) {
      throw authError;
    }

    console.log('✅ User created in auth system');

    // Create or update user profile with admin role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: authData.user.id,
        full_name: fullName.trim(),
        role: 'admin',
        is_active: true
      });

    if (profileError) {
      console.warn('⚠️ Profile creation failed, but user exists in auth:', profileError.message);
      console.log('   You may need to manually set the role in the user_profiles table');
    } else {
      console.log('✅ Admin profile created');
    }

    console.log('\n🎉 Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${fullName}`);
    console.log(`🔑 Role: admin`);
    console.log(`🆔 User ID: ${authData.user.id}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. The admin user can now sign in at /auth');
    console.log('2. They will be redirected to /admin after login');
    console.log('3. They can manage documents, users, and AI settings');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.message.includes('already registered')) {
      console.log('\n💡 User already exists. To make them admin:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to Authentication > Users');
      console.log('3. Find the user and edit their User Metadata');
      console.log('4. Add: {"role": "admin"}');
      console.log('5. Update the user_profiles table role to "admin"');
    }
  } finally {
    rl.close();
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Run the script
createAdminUser();