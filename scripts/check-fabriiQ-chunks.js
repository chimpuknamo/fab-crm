// Script to check what FabriiQ-related chunks are in the database
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function checkFabriiQChunks() {
  console.log('🔍 Checking FabriiQ-related chunks in database...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Get documents that mention FabriiQ
    console.log('📄 Looking for documents mentioning FabriiQ...')
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('id, title, processing_status')
      .ilike('title', '%fabriiQ%')
    
    if (docsError) {
      console.error('❌ Error querying documents:', docsError)
      return
    }
    
    console.log(`✅ Found ${docs.length} documents with FabriiQ in title:`)
    docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.title} (${doc.processing_status})`)
    })
    
    if (docs.length === 0) {
      // Try broader search
      console.log('\\n🔄 Trying broader document search...')
      const { data: allDocs, error: allDocsError } = await supabase
        .from('documents')
        .select('id, title, processing_status')
        .eq('processing_status', 'completed')
        .limit(10)
      
      if (!allDocsError) {
        console.log(`✅ Found ${allDocs.length} completed documents:`)
        allDocs.forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.title}`)
        })
        docs.push(...allDocs.slice(0, 3)) // Take first 3 for chunk analysis
      }
    }
    
    // Now check chunks from these documents
    if (docs.length > 0) {
      console.log(`\\n🧩 Checking chunks from first few documents...`)
      
      const docIds = docs.slice(0, 3).map(doc => doc.id)
      
      const { data: chunks, error: chunksError } = await supabase
        .from('document_chunks')
        .select('id, document_id, chunk_index, content')
        .in('document_id', docIds)
        .order('document_id', { ascending: true })
        .order('chunk_index', { ascending: true })
        .limit(10)
      
      if (chunksError) {
        console.error('❌ Error querying chunks:', chunksError)
        return
      }
      
      console.log(`✅ Found ${chunks.length} chunks:`)
      
      chunks.forEach((chunk, index) => {
        const doc = docs.find(d => d.id === chunk.document_id)
        console.log(`\\n--- CHUNK ${index + 1} ---`)
        console.log(`Document: ${doc?.title || 'Unknown'}`)
        console.log(`Chunk Index: ${chunk.chunk_index}`)
        console.log(`Content Length: ${chunk.content.length} chars`)
        console.log('Content Preview:')
        console.log(chunk.content.substring(0, 300) + (chunk.content.length > 300 ? '...' : ''))
        
        // Check if this chunk mentions FabriiQ
        if (chunk.content.toLowerCase().includes('fabriiQ'.toLowerCase())) {
          console.log('🎯 This chunk mentions FabriiQ!')
        }
        console.log('-'.repeat(80))
      })
      
      // Look specifically for chunks that mention "FabriiQ" in content
      console.log('\\n🎯 Looking specifically for chunks mentioning FabriiQ...')
      const { data: fabriiQChunks, error: fabriiQError } = await supabase
        .from('document_chunks')
        .select('id, document_id, chunk_index, content')
        .ilike('content', '%fabriiQ%')
        .limit(5)
      
      if (!fabriiQError && fabriiQChunks) {
        console.log(`✅ Found ${fabriiQChunks.length} chunks specifically mentioning FabriiQ:`)
        
        fabriiQChunks.forEach((chunk, index) => {
          console.log(`\\n=== FabriiQ CHUNK ${index + 1} ===`)
          console.log(`Content Length: ${chunk.content.length} chars`)
          console.log('Full Content:')
          console.log(chunk.content)
          console.log('='.repeat(80))
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkFabriiQChunks()