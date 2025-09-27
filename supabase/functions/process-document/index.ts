import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Note: In a production environment, you would use @huggingface/transformers
// For now, we'll simulate the embedding generation
async function generateEmbedding(text: string): Promise<number[]> {
  // This is a placeholder - in production, you would use:
  // const { pipeline } = await import('https://esm.sh/@huggingface/transformers@2.6.0')
  // const pipe = await pipeline('feature-extraction', 'Supabase/gte-small')
  // const embedding = await pipe(text, { pooling: 'mean', normalize: true })
  // return Array.from(embedding.data)
  
  // For demo purposes, return a random 384-dimensional vector
  return Array.from({ length: 384 }, () => Math.random() * 2 - 1)
}

function splitIntoChunks(text: string, chunkSize: number = 500, overlap: number = 50): Array<{
  content: string
  metadata: {
    start_index: number
    end_index: number
    length: number
    chunk_number: number
  }
}> {
  const chunks: Array<{
    content: string
    metadata: {
      start_index: number
      end_index: number
      length: number
      chunk_number: number
    }
  }> = []
  
  let start = 0
  let chunkNumber = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    
    // Try to break at word boundaries
    let actualEnd = end
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end)
      if (lastSpace > start + chunkSize * 0.8) {
        actualEnd = lastSpace
      }
    }
    
    const content = text.slice(start, actualEnd).trim()
    
    if (content.length > 0) {
      chunks.push({
        content,
        metadata: {
          start_index: start,
          end_index: actualEnd,
          length: content.length,
          chunk_number: chunkNumber
        }
      })
      chunkNumber++
    }
    
    // Move start position with overlap
    start = Math.max(actualEnd - overlap, start + 1)
    
    // Prevent infinite loop
    if (start >= actualEnd && actualEnd >= text.length) break
  }
  
  return chunks
}

function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4)
}

serve(async (req) => {
  try {
    // Handle CORS for browser requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      })
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { documentId, content, settings } = await req.json()
    
    if (!documentId || !content) {
      return new Response(JSON.stringify({ 
        error: 'documentId and content are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update document processing status
    await supabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId)

    try {
      // Get processing settings from database or use defaults
      const chunkSize = settings?.chunk_size || 500
      const chunkOverlap = settings?.chunk_overlap || 50
      
      console.log(`Processing document ${documentId} with ${content.length} characters`)
      
      // Split content into chunks
      const chunks = splitIntoChunks(content, chunkSize, chunkOverlap)
      console.log(`Created ${chunks.length} chunks`)
      
      // Process chunks in batches to avoid timeouts
      const batchSize = 10
      const processedChunks = []
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`)
        
        const batchResults = await Promise.all(
          batch.map(async (chunk, batchIndex) => {
            const globalIndex = i + batchIndex
            
            try {
              // Generate embedding for the chunk
              console.log(`Generating embedding for chunk ${globalIndex + 1}`)
              const embedding = await generateEmbedding(chunk.content)
              
              return {
                document_id: documentId,
                content: chunk.content,
                chunk_index: globalIndex,
                embedding,
                metadata: {
                  ...chunk.metadata,
                  processing_timestamp: new Date().toISOString(),
                  embedding_model: 'gte-small-simulated'
                },
                token_count: estimateTokenCount(chunk.content)
              }
            } catch (error) {
              console.error(`Error processing chunk ${globalIndex + 1}:`, error)
              throw error
            }
          })
        )
        
        processedChunks.push(...batchResults)
      }
      
      // Delete existing chunks for this document
      await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId)
      
      // Insert new chunks
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(processedChunks)
      
      if (insertError) {
        throw insertError
      }
      
      // Update document status to completed
      await supabase
        .from('documents')
        .update({ 
          processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
      
      // Log analytics
      await supabase
        .from('ai_analytics')
        .insert({
          event_type: 'document_processed',
          metadata: {
            document_id: documentId,
            chunks_created: processedChunks.length,
            total_tokens: processedChunks.reduce((sum, chunk) => sum + (chunk.token_count || 0), 0),
            processing_time_ms: Date.now() - new Date().getTime(),
            success: true
          }
        })
      
      console.log(`Successfully processed document ${documentId}`)
      
      return new Response(JSON.stringify({ 
        success: true,
        document_id: documentId,
        chunks_processed: processedChunks.length,
        total_tokens: processedChunks.reduce((sum, chunk) => sum + (chunk.token_count || 0), 0)
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
      
    } catch (processingError) {
      console.error('Document processing error:', processingError)
      
      // Update document status to failed
      await supabase
        .from('documents')
        .update({ 
          processing_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
      
      // Log error analytics
      await supabase
        .from('ai_analytics')
        .insert({
          event_type: 'document_processing_failed',
          metadata: {
            document_id: documentId,
            error: processingError.message,
            timestamp: new Date().toISOString()
          }
        })
      
      throw processingError
    }

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})