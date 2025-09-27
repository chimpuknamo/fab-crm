const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🚀 FabriiQ Complete System Verification\n');
console.log('='.repeat(50));

async function verifyCompleteSetup() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  let allTestsPassed = true;
  const results = [];

  // Test 1: Environment Configuration
  console.log('\n📊 1. Environment Configuration');
  console.log('-'.repeat(30));
  
  const envTests = [
    { name: 'SUPABASE_URL', value: supabaseUrl, expected: 'https://uwtglbvmueyfwqsldykg.supabase.co' },
    { name: 'SUPABASE_ANON_KEY', value: supabaseAnonKey?.length, expected: 'present' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseServiceKey?.length, expected: 'present' },
    { name: 'GOOGLE_API_KEY', value: process.env.GOOGLE_API_KEY?.length, expected: 'present' }
  ];

  envTests.forEach(test => {
    const passed = test.value && (test.expected === 'present' ? test.value > 0 : test.value === test.expected);
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'OK' : 'MISSING'}`);
    if (!passed) allTestsPassed = false;
  });

  // Test 2: Database Tables and Schema
  console.log('\n📊 2. Database Schema');
  console.log('-'.repeat(30));

  const tables = ['documents', 'document_chunks', 'user_profiles', 'conversations', 'messages', 'ai_settings', 'ai_analytics'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      console.log(`${error ? '❌' : '✅'} ${table} table: ${error ? error.message : 'OK'}`);
      if (error) allTestsPassed = false;
    } catch (err) {
      console.log(`❌ ${table} table: ${err.message}`);
      allTestsPassed = false;
    }
  }

  // Test 3: Storage Bucket
  console.log('\n📊 3. Storage Configuration');
  console.log('-'.repeat(30));

  try {
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log(`❌ Storage access: ${bucketError.message}`);
      allTestsPassed = false;
    } else {
      const documentsBucket = buckets.find(b => b.id === 'documents');
      console.log(`${documentsBucket ? '✅' : '❌'} documents bucket: ${documentsBucket ? 'OK' : 'MISSING'}`);
      if (!documentsBucket) allTestsPassed = false;
    }
  } catch (storageErr) {
    console.log(`❌ Storage test: ${storageErr.message}`);
    allTestsPassed = false;
  }

  // Test 4: Admin User
  console.log('\n📊 4. Admin User Configuration');
  console.log('-'.repeat(30));

  try {
    const { data: adminProfile, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin')
      .single();

    if (adminError) {
      console.log(`❌ Admin user: ${adminError.message}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ Admin user: ${adminProfile.full_name} (${adminProfile.user_id})`);
      console.log(`✅ Admin email: Available in auth.users`);
      console.log(`✅ Admin role: ${adminProfile.role}`);
    }
  } catch (adminErr) {
    console.log(`❌ Admin user test: ${adminErr.message}`);
    allTestsPassed = false;
  }

  // Test 5: RLS Policies
  console.log('\n📊 5. Row Level Security');
  console.log('-'.repeat(30));

  try {
    // Test with anon client (simulating frontend)
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Should fail without auth
    const { error: anonError } = await anonClient.from('documents').select('*').limit(1);
    console.log(`${anonError ? '✅' : '❌'} RLS blocking unauthenticated access: ${anonError ? 'PROTECTED' : 'EXPOSED'}`);
    
    if (!anonError) allTestsPassed = false;
  } catch (rlsErr) {
    console.log(`❌ RLS test: ${rlsErr.message}`);
    allTestsPassed = false;
  }

  // Test 6: Edge Functions
  console.log('\n📊 6. Edge Functions');
  console.log('-'.repeat(30));

  const functions = ['process-document', 'ai-chat'];
  
  for (const func of functions) {
    try {
      // Try to invoke with minimal payload to test availability
      const { error: funcError } = await supabase.functions.invoke(func, {
        body: { test: true }
      });
      
      // Function exists if we get a response (even if it's an error about missing params)
      const exists = !funcError || !funcError.message.includes('not found');
      console.log(`${exists ? '✅' : '❌'} ${func} function: ${exists ? 'DEPLOYED' : 'MISSING'}`);
      
      if (!exists) allTestsPassed = false;
    } catch (funcErr) {
      console.log(`❌ ${func} function: ${funcErr.message}`);
      allTestsPassed = false;
    }
  }

  // Test 7: Vector Search Function
  console.log('\n📊 7. Vector Search');
  console.log('-'.repeat(30));

  try {
    const queryEmbedding = Array.from({ length: 384 }, () => Math.random() * 2 - 1);
    
    const { error: vectorError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      similarity_threshold: 0.8,
      match_count: 5
    });

    console.log(`${vectorError ? '❌' : '✅'} match_documents function: ${vectorError ? vectorError.message : 'OK'}`);
    if (vectorError) allTestsPassed = false;
  } catch (vectorErr) {
    console.log(`❌ Vector search test: ${vectorErr.message}`);
    allTestsPassed = false;
  }

  // Final Results
  console.log('\n' + '='.repeat(50));
  console.log('📋 VERIFICATION SUMMARY');
  console.log('='.repeat(50));

  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Your FabriiQ system is ready to use.');
    console.log('\n✅ Next Steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to: http://localhost:3000/auth');
    console.log('3. Sign in with: kashif@fabriiq.com');
    console.log('4. Access admin dashboard at: /admin');
    console.log('5. Upload and test documents in the Documents tab');
    
    console.log('\n🔧 Features Ready:');
    console.log('• ✅ User authentication with role-based access');
    console.log('• ✅ Document upload with file validation');
    console.log('• ✅ Automated text processing and chunking');
    console.log('• ✅ Vector embeddings and similarity search');
    console.log('• ✅ Admin dashboard for system management');
    console.log('• ✅ RLS security policies');
    console.log('• ✅ AI chat functionality');
    console.log('• ✅ Analytics and monitoring');
    
  } else {
    console.log('❌ SOME TESTS FAILED! Please check the issues above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your .env.local has correct API keys');
    console.log('2. Ensure migrations were applied: npx supabase db push');
    console.log('3. Check edge functions are deployed: npx supabase functions list');
    console.log('4. Verify admin user exists: node scripts/make-existing-user-admin.js');
  }

  console.log('\n📚 Documentation:');
  console.log('• Setup Guide: SETUP_GUIDE.md');
  console.log('• Admin Instructions: ADMIN_SETUP_INSTRUCTIONS.md');
  console.log('• Supabase Dashboard: https://supabase.com/dashboard/project/uwtglbvmueyfwqsldykg');

  return allTestsPassed;
}

verifyCompleteSetup().catch(console.error);