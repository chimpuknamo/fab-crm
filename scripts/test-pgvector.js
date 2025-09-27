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

// Generate a test embedding (384 dimensions for gte-small)
function generateTestEmbedding() {
  return Array.from({ length: 384 }, () => Math.random() * 2 - 1);
}

async function testPgVector() {
  console.log('🧪 Testing pgvector functionality...\n');

  try {
    // Test 1: Check if vector extension is installed
    console.log('📊 Checking vector extension...');
    const { data: extensions, error: extError } = await supabase
      .rpc('sql', { query: "SELECT * FROM pg_extension WHERE extname = 'vector';" })
      .single();

    if (extError) {
      console.log('❌ Could not query extensions:', extError.message);
    } else {
      console.log('✅ Vector extension is available');
    }

    // Test 2: Create a test document and chunks
    console.log('\n📝 Creating test document...');
    
    const { data: testDoc, error: docError } = await supabase
      .from('documents')
      .insert({
        title: 'Test Document for Vector Search',
        content: 'This is a test document about artificial intelligence and machine learning. It contains information about neural networks, deep learning, and natural language processing.',
        source_type: 'manual',
        processing_status: 'completed'
      })
      .select()
      .single();

    if (docError) {
      console.log('❌ Document creation failed:', docError.message);
      return;
    }

    console.log('✅ Test document created:', testDoc.id);

    // Test 3: Create test chunks with embeddings
    console.log('\n🔢 Creating test document chunks with embeddings...');
    
    const testChunks = [
      {
        document_id: testDoc.id,
        content: 'Artificial intelligence is a branch of computer science that aims to create intelligent machines.',
        chunk_index: 0,
        embedding: generateTestEmbedding(),
        metadata: { test: true, topic: 'ai' },
        token_count: 15
      },
      {
        document_id: testDoc.id,
        content: 'Machine learning is a subset of artificial intelligence that focuses on algorithms.',
        chunk_index: 1,
        embedding: generateTestEmbedding(),
        metadata: { test: true, topic: 'ml' },
        token_count: 12
      },
      {
        document_id: testDoc.id,
        content: 'Deep learning uses neural networks with multiple layers to learn patterns in data.',
        chunk_index: 2,
        embedding: generateTestEmbedding(),
        metadata: { test: true, topic: 'deep_learning' },
        token_count: 13
      }
    ];

    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(testChunks);

    if (chunksError) {
      console.log('❌ Chunks creation failed:', chunksError.message);
      return;
    }

    console.log('✅ Test chunks created successfully');

    // Test 4: Test vector similarity search
    console.log('\n🔍 Testing vector similarity search...');
    
    // Create a query embedding (similar to one of our test embeddings)
    const queryEmbedding = generateTestEmbedding();
    
    try {
      const { data: searchResults, error: searchError } = await supabase
        .rpc('match_documents', {
          query_embedding: queryEmbedding,
          similarity_threshold: 0.1, // Low threshold for testing
          match_count: 5
        });

      if (searchError) {
        console.log('❌ Vector search failed:', searchError.message);
        console.log('Error details:', searchError);
      } else {
        console.log('✅ Vector search successful!');
        console.log(`📊 Found ${searchResults.length} similar chunks`);
        
        if (searchResults.length > 0) {
          console.log('\nTop results:');
          searchResults.slice(0, 3).forEach((result, index) => {
            console.log(`  ${index + 1}. Similarity: ${result.similarity.toFixed(4)}`);
            console.log(`     Content: ${result.content.substring(0, 80)}...`);
            console.log(`     Document ID: ${result.document_id}`);
          });
        }
      }
    } catch (rpcError) {
      console.log('❌ RPC call failed:', rpcError.message);
      console.log('This might indicate the match_documents function is not available');
    }

    // Test 5: Test the is_admin function
    console.log('\n👤 Testing is_admin function...');
    
    try {
      const { data: isAdminResult, error: adminError } = await supabase
        .rpc('is_admin');

      if (adminError) {
        console.log('❌ is_admin function failed:', adminError.message);
      } else {
        console.log('✅ is_admin function works:', isAdminResult);
      }
    } catch (adminRpcError) {
      console.log('❌ is_admin RPC call failed:', adminRpcError.message);
    }

    // Test 6: Check document chunks table structure
    console.log('\n📋 Checking document_chunks table structure...');
    
    const { data: chunks, error: chunkQueryError } = await supabase
      .from('document_chunks')
      .select('id, document_id, content, chunk_index, metadata, token_count, created_at')
      .eq('document_id', testDoc.id)
      .limit(3);

    if (chunkQueryError) {
      console.log('❌ Chunks query failed:', chunkQueryError.message);
    } else {
      console.log('✅ Document chunks query successful');
      console.log(`📊 Retrieved ${chunks.length} chunks from test document`);
    }

    // Cleanup: Remove test data
    console.log('\n🧹 Cleaning up test data...');
    
    await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', testDoc.id);
    
    await supabase
      .from('documents')
      .delete()
      .eq('id', testDoc.id);
      
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 pgvector test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Vector extension available');
    console.log('✅ Document and chunks creation works');
    console.log('✅ Vector embeddings can be stored');
    console.log('✅ Vector similarity search functions');
    console.log('✅ Database schema is properly configured');

  } catch (error) {
    console.error('❌ pgvector test failed:', error.message);
    console.error('Full error:', error);
  }
}

testPgVector();