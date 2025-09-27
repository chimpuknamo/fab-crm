// Script to test database connection and knowledge base content
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection and knowledge base...')
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Required variables:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test basic connection
    console.log('✅ Supabase client initialized')
    console.log('🔗 URL:', supabaseUrl.substring(0, 30) + '...')
    
    // Check documents table
    console.log('\n📄 Checking documents table...')
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, title, processing_status, created_at')
      .limit(10)
    
    if (docsError) {
      console.error('❌ Error querying documents:', docsError)
    } else {
      console.log(`✅ Found ${documents.length} documents`)
      documents.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.title} (${doc.processing_status})`)
      })
    }
    
    // Check document_chunks table
    console.log('\n🧩 Checking document_chunks table...')
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('id, document_id, chunk_index, embedding')
      .limit(10)
    
    if (chunksError) {
      console.error('❌ Error querying chunks:', chunksError)
    } else {
      console.log(`✅ Found ${chunks.length} document chunks`)
      const chunksWithEmbeddings = chunks.filter(chunk => chunk.embedding)
      console.log(`   - ${chunksWithEmbeddings.length} chunks have embeddings`)
      
      if (chunks.length > 0) {
        console.log('   Sample chunks:')
        chunks.slice(0, 3).forEach((chunk, index) => {
          console.log(`     ${index + 1}. Chunk ${chunk.chunk_index} (has embedding: ${!!chunk.embedding})`)
        })
      }
    }
    
    // Test the match_documents RPC function
    console.log('\n🎯 Testing match_documents RPC function...')
    
    if (chunks && chunks.length > 0 && chunks[0].embedding) {
      // Use the first embedding as a test query
      const testEmbedding = chunks[0].embedding
      
      const { data: matchResult, error: rpcError } = await supabase
        .rpc('match_documents', {
          query_embedding: testEmbedding,
          similarity_threshold: 0.5,
          match_count: 3
        })
      
      if (rpcError) {
        console.error('❌ Error testing match_documents RPC:', rpcError)
      } else {
        console.log(`✅ RPC function works! Found ${matchResult.length} matches`)
        matchResult.forEach((match, index) => {
          console.log(`   ${index + 1}. Similarity: ${match.similarity.toFixed(3)}`)
        })
      }
    } else {
      console.log('⚠️  No embeddings found to test RPC function')
    }
    
    // Check if there are any processed documents
    console.log('\n📊 Processing status summary...')
    const { data: statusSummary, error: statusError } = await supabase
      .from('documents')
      .select('processing_status')
    
    if (!statusError && statusSummary) {
      const statusCounts = statusSummary.reduce((acc, doc) => {
        acc[doc.processing_status] = (acc[doc.processing_status] || 0) + 1
        return acc
      }, {})
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`)
      })
    }
    
    console.log('\n✅ Database connection test completed!')
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    process.exit(1)
  }
}

testDatabaseConnection()