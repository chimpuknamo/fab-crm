const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Service Key (first 20 chars):', supabaseServiceKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Test 1: Check if we can query the user_profiles table
    console.log('\n📊 Testing database connection...');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Database query failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
      console.log('Current user profiles count:', data?.length || 0);
    }

    // Test 2: Check existing users in auth
    console.log('\n👥 Checking existing auth users...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth query failed:', authError.message);
    } else {
      console.log('✅ Auth connection successful');
      console.log('Current auth users count:', authData?.users?.length || 0);
      
      if (authData?.users?.length > 0) {
        console.log('Existing users:');
        authData.users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();