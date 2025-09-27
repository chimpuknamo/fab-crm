const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function makeUserAdmin() {
  try {
    console.log('🚀 Making existing user admin...\n');

    // Get the existing user
    const userId = '87db4038-9cc7-474c-ae60-a2f5e2d0098f';
    const userEmail = 'kashif@fabriiq.com';
    
    console.log(`👤 User: ${userEmail}`);
    console.log(`🆔 ID: ${userId}`);

    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingProfile) {
      console.log('📝 User profile exists, updating to admin...');
      
      // Update existing profile to admin
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('user_id', userId);

      if (updateError) throw updateError;
      
      console.log('✅ User profile updated to admin');
    } else {
      console.log('📝 Creating new admin user profile...');
      
      // Create new admin profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          full_name: 'Kashif Admin',
          role: 'admin',
          is_active: true
        });

      if (insertError) throw insertError;
      
      console.log('✅ Admin user profile created');
    }

    // Update auth user metadata to include admin role
    console.log('🔧 Updating auth user metadata...');
    
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          role: 'admin',
          full_name: 'Kashif Admin'
        }
      }
    );

    if (authUpdateError) {
      console.warn('⚠️ Auth metadata update warning:', authUpdateError.message);
    } else {
      console.log('✅ Auth user metadata updated');
    }

    // Verify the setup
    console.log('\n🔍 Verifying admin setup...');
    
    const { data: finalProfile, error: verifyError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (verifyError) throw verifyError;

    console.log('\n🎉 Admin user setup complete!');
    console.log('📧 Email:', userEmail);
    console.log('👤 Name:', finalProfile.full_name);
    console.log('🔑 Role:', finalProfile.role);
    console.log('📊 Active:', finalProfile.is_active);
    console.log('🆔 User ID:', finalProfile.user_id);
    
    console.log('\n📝 Next steps:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Go to: http://localhost:3000/auth');
    console.log('3. Sign in with: kashif@fabriiq.com');
    console.log('4. You should be redirected to /admin');

  } catch (error) {
    console.error('❌ Error making user admin:', error.message);
    console.error('Details:', error);
  }
}

makeUserAdmin();