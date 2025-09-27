// Script to find short or problematic chunks that might be interfering with search
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function findProblematicChunks() {
  console.log('🔍 Looking for short or problematic chunks...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Find very short chunks
    console.log('📏 Looking for very short chunks (< 100 characters)...')
    const { data: shortChunks, error: shortError } = await supabase
      .from('document_chunks')
      .select('id, document_id, chunk_index, content')
      .lt('length(content)', 100)
      .order('content')
    
    if (!shortError && shortChunks) {
      console.log(`✅ Found ${shortChunks.length} very short chunks:`)
      shortChunks.forEach((chunk, index) => {
        console.log(`\\n--- SHORT CHUNK ${index + 1} ---`)
        console.log(`Length: ${chunk.content.length} chars`)
        console.log(`Content: "${chunk.content}"`)
      })
    }
    
    // Find chunks with just "FabriiQ technical team" or similar fragments
    console.log('\\n🎯 Looking for chunks containing "technical team"...')
    const { data: techTeamChunks, error: techError } = await supabase
      .from('document_chunks')
      .select('id, document_id, chunk_index, content')
      .ilike('content', '%technical team%')
    
    if (!techError && techTeamChunks) {
      console.log(`✅ Found ${techTeamChunks.length} chunks mentioning "technical team":`)
      techTeamChunks.forEach((chunk, index) => {
        console.log(`\\n--- TECH TEAM CHUNK ${index + 1} ---`)
        console.log(`Length: ${chunk.content.length} chars`)
        console.log(`Content: "${chunk.content}"`)
      })
    }
    
    // Look for the shortest chunks that might have embeddings
    console.log('\\n📊 Getting chunk length distribution...')
    const { data: allChunks, error: allError } = await supabase
      .from('document_chunks')
      .select('content')
    
    if (!allError && allChunks) {
      const lengths = allChunks.map(chunk => chunk.content.length)
      lengths.sort((a, b) => a - b)
      
      console.log(`Total chunks: ${lengths.length}`)
      console.log(`Shortest: ${lengths[0]} characters`)
      console.log(`Longest: ${lengths[lengths.length - 1]} characters`)
      console.log(`Average: ${Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)} characters`)
      console.log(`Median: ${lengths[Math.floor(lengths.length / 2)]} characters`)
      
      // Show shortest 10 chunk lengths
      console.log(`\\n10 shortest chunks: ${lengths.slice(0, 10).join(', ')} characters`)
    }
    
    // Look for potential duplicate or near-duplicate chunks
    console.log('\\n🔍 Looking for potentially duplicate chunks...')
    const { data: duplicateChunks, error: dupError } = await supabase
      .from('document_chunks')
      .select('content')
      .order('content')
      .limit(50)
    
    if (!dupError && duplicateChunks) {
      const contentMap = {}
      duplicateChunks.forEach(chunk => {
        const trimmed = chunk.content.trim()
        if (contentMap[trimmed]) {
          contentMap[trimmed]++
        } else {
          contentMap[trimmed] = 1
        }
      })
      
      const duplicates = Object.entries(contentMap).filter(([content, count]) => count > 1)
      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} potentially duplicate contents:`)
        duplicates.forEach(([content, count]) => {
          console.log(`\\n"${content.substring(0, 100)}..." (${count} times)`)
        })
      } else {
        console.log('No obvious duplicates found in sample.')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

findProblematicChunks()