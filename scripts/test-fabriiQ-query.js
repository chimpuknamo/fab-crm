// Script to test exactly what chunks are retrieved for "what is fabriiQ" query
const { createClient } = require('@supabase/supabase-js')
const { pipeline } = require('@xenova/transformers')
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function testFabriiQQuery() {
  console.log('🔍 Testing "what is fabriiQ" query...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Generate embedding for "what is fabriiQ"
    console.log('🔄 Generating embedding for "what is fabriiQ"...')
    
    const embedder = await pipeline(
      'feature-extraction',
      'Supabase/gte-small',
      {
        cache_dir: './models/cache',
        local_files_only: false,
        revision: 'main'
      }
    )
    
    const output = await embedder('what is fabriiQ', {
      pooling: 'mean',
      normalize: true,
    })
    
    const queryEmbedding = Array.from(output.data)
    console.log('✅ Generated embedding with dimensions:', queryEmbedding.length)
    
    // Test with different similarity thresholds
    const thresholds = [0.7, 0.5, 0.3]
    
    for (const threshold of thresholds) {
      console.log(`\\n🎯 Testing with similarity threshold: ${threshold}`)
      
      const { data: searchResults, error: searchError } = await supabase
        .rpc('match_documents', {
          query_embedding: queryEmbedding,
          similarity_threshold: threshold,
          match_count: 5
        })
      
      if (searchError) {
        console.error('❌ Search error:', searchError)
        continue
      }
      
      console.log(`✅ Found ${searchResults.length} chunks:`)
      
      searchResults.forEach((result, index) => {
        console.log(`\\n--- CHUNK ${index + 1} (Similarity: ${result.similarity.toFixed(3)}) ---`)
        console.log(`Length: ${result.content.length} characters`)
        console.log('Content:')
        console.log(result.content)
        console.log('---')
      })
      
      if (searchResults.length > 0) {
        // Show what the combined context would look like
        const context = searchResults
          .map((chunk, index) => `[Context ${index + 1} (${(chunk.similarity * 100).toFixed(1)}% relevant)]\\n${chunk.content}`)
          .join('\\n\\n')
        
        console.log(`\\n📝 Combined RAG context (${context.length} characters):`)
        console.log('='.repeat(80))
        console.log(context.substring(0, 1000) + (context.length > 1000 ? '\\n... (truncated)' : ''))
        console.log('='.repeat(80))
        
        break // Found results, no need to try lower thresholds
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFabriiQQuery()