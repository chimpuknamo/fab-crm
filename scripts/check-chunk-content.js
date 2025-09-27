// Script to check sample chunk content
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function checkChunkContent() {
  console.log('🔍 Checking sample chunk content...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Get a few sample chunks with their content
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('id, document_id, chunk_index, content')
      .limit(3)
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    console.log(`✅ Found ${chunks.length} sample chunks:\n`)
    
    chunks.forEach((chunk, index) => {
      console.log(`--- CHUNK ${index + 1} (Document ID: ${chunk.document_id.substring(0, 8)}...) ---`)
      console.log(`Content (${chunk.content.length} chars):`)
      console.log(chunk.content.substring(0, 300) + (chunk.content.length > 300 ? '...' : ''))
      console.log('\n')
    })
    
    // Test with a simple query similar to "what is fabriiQ"
    console.log('🎯 Testing vector search with "what is fabriiQ" type query...')
    
    // Simple test embedding (we'll use a real one from the database)
    const { data: testChunk } = await supabase
      .from('document_chunks')
      .select('embedding')
      .limit(1)
      .single()
    
    if (testChunk && testChunk.embedding) {
      const { data: searchResults, error: searchError } = await supabase
        .rpc('match_documents', {
          query_embedding: testChunk.embedding,
          similarity_threshold: 0.5,
          match_count: 3
        })
      
      if (searchError) {
        console.error('❌ Search error:', searchError)
      } else {
        console.log(`✅ Vector search returned ${searchResults.length} results:`)
        searchResults.forEach((result, index) => {
          console.log(`\n--- RESULT ${index + 1} (Similarity: ${result.similarity.toFixed(3)}) ---`)
          console.log(result.content.substring(0, 200) + '...')
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkChunkContent()