import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Simulated embedding generation (replace with actual model in production)
async function generateQueryEmbedding(query: string): Promise<number[]> {
  // In production, use @huggingface/transformers:
  // const { pipeline } = await import('https://esm.sh/@huggingface/transformers@2.6.0')
  // const pipe = await pipeline('feature-extraction', 'Supabase/gte-small')
  // const embedding = await pipe(query, { pooling: 'mean', normalize: true })
  // return Array.from(embedding.data)
  
  // For demo: return a random 384-dimensional vector
  return Array.from({ length: 384 }, () => Math.random() * 2 - 1)
}

function generateContextualResponse(query: string, context: string[], conversationHistory: any[]): string {
  const lowerQuery = query.toLowerCase()
  
  // Enhanced responses using context
  if (context && context.length > 0) {
    const contextText = context.join('\n\n')
    
    if (lowerQuery.includes('feature') || lowerQuery.includes('capability')) {
      return `Based on our knowledge base, FabriiQ offers comprehensive educational management capabilities including:\n\n${contextText.substring(0, 300)}...\n\nWould you like me to elaborate on any specific feature?`
    }
    
    if (lowerQuery.includes('student') || lowerQuery.includes('management')) {
      return `Here's what I found about student management in FabriiQ:\n\n${contextText.substring(0, 400)}...\n\nThis information should help you understand how FabriiQ handles student data and workflows.`
    }
    
    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence')) {
      return `FabriiQ's AI capabilities include:\n\n${contextText.substring(0, 350)}...\n\nOur AI features are designed to enhance educational outcomes through intelligent automation and insights.`
    }
    
    // Generic contextual response
    return `Based on the available information:\n\n${contextText.substring(0, 400)}...\n\nIs this helpful? Feel free to ask for more specific details!`
  }
  
  // Fallback responses when no context is found
  const fallbackResponses = {
    feature: "I'd be happy to help you learn about FabriiQ's features! Our platform includes student information systems, course management, assessment tools, analytics dashboards, and communication systems. What specific area interests you most?",
    
    ai: "FabriiQ incorporates AI-powered features to enhance educational management. This includes intelligent analytics, automated insights, and personalized recommendations for better student outcomes. Our AI capabilities are continuously evolving in this alpha version.",
    
    student: "FabriiQ's student management system provides comprehensive tracking and management capabilities. You can monitor academic progress, attendance, performance metrics, and create personalized learning paths. How can I help you with student management specifically?",
    
    admin: "Our administrative features include user management, institutional settings, reporting tools, and system configuration. Administrators have full control over permissions, workflows, and can generate detailed analytics reports.",
    
    default: "I'm here to help you with questions about FabriiQ's educational management platform. You can ask about our features, student management, AI capabilities, administrative tools, or any other aspect of the platform. What would you like to know?"
  }
  
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (key !== 'default' && lowerQuery.includes(key)) {
      return response
    }
  }
  
  return fallbackResponses.default
}

serve(async (req) => {
  try {
    // Handle CORS
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

    const { message, conversationId, userId } = await req.json()
    
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Processing chat request from user ${userId}: ${message.substring(0, 100)}...`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const startTime = Date.now()

    try {
      // Generate embedding for the user query
      console.log('Generating query embedding...')
      const queryEmbedding = await generateQueryEmbedding(message)

      // Get AI settings for search parameters
      const { data: settings } = await supabase
        .from('ai_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['similarity_threshold', 'max_results'])

      const settingsMap = settings?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value
        return acc
      }, {} as Record<string, any>) || {}

      const similarityThreshold = settingsMap.similarity_threshold || 0.7
      const maxResults = settingsMap.max_results || 5

      // Perform vector search for relevant context
      console.log('Performing vector search...')
      const { data: relevantChunks, error: searchError } = await supabase
        .rpc('match_documents', {
          query_embedding: queryEmbedding,
          similarity_threshold: similarityThreshold,
          match_count: maxResults
        })

      if (searchError) {
        console.warn('Vector search error:', searchError)
      }

      // Get conversation history for context
      const { data: conversationHistory } = await supabase
        .from('messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10)

      console.log(`Found ${relevantChunks?.length || 0} relevant chunks`)
      console.log(`Retrieved ${conversationHistory?.length || 0} previous messages`)

      // Extract context from relevant chunks
      const context = relevantChunks?.map(chunk => chunk.content) || []

      // Generate response using context and conversation history
      const response = generateContextualResponse(
        message, 
        context, 
        conversationHistory || []
      )

      const processingTime = Date.now() - startTime

      // Ensure conversation exists
      if (conversationId && conversationId !== 'default') {
        const { error: conversationError } = await supabase
          .from('conversations')
          .upsert({
            id: conversationId,
            user_id: userId,
            title: message.length > 50 ? message.substring(0, 47) + '...' : message,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })

        if (conversationError) {
          console.warn('Conversation upsert error:', conversationError)
        }
      }

      // Save messages to database
      const messagesToInsert = [
        {
          conversation_id: conversationId,
          role: 'user',
          content: message,
          metadata: {
            processing_time_ms: processingTime,
            query_embedding_generated: true
          }
        },
        {
          conversation_id: conversationId,
          role: 'assistant',
          content: response,
          metadata: {
            context_chunks_used: relevantChunks?.length || 0,
            similarity_scores: relevantChunks?.map(c => c.similarity) || [],
            processing_time_ms: processingTime,
            model_used: 'contextual-response-generator'
          },
          processing_time_ms: processingTime
        }
      ]

      const { error: messagesError } = await supabase
        .from('messages')
        .insert(messagesToInsert)

      if (messagesError) {
        console.warn('Messages insert error:', messagesError)
      }

      // Log analytics
      await supabase
        .from('ai_analytics')
        .insert({
          event_type: 'chat_completion',
          user_id: userId,
          session_id: conversationId,
          metadata: {
            message_length: message.length,
            response_length: response.length,
            context_chunks: relevantChunks?.length || 0,
            processing_time_ms: processingTime,
            similarity_threshold: similarityThreshold,
            success: true
          }
        })

      console.log(`Chat request completed in ${processingTime}ms`)

      return new Response(JSON.stringify({
        response,
        conversationId,
        metadata: {
          processing_time_ms: processingTime,
          context_chunks_used: relevantChunks?.length || 0,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })

    } catch (processingError) {
      console.error('Chat processing error:', processingError)
      
      const processingTime = Date.now() - startTime
      
      // Log error analytics
      await supabase
        .from('ai_analytics')
        .insert({
          event_type: 'chat_error',
          user_id: userId,
          session_id: conversationId,
          metadata: {
            error: processingError.message,
            processing_time_ms: processingTime,
            message_length: message.length
          }
        })

      // Return a helpful error response
      const errorResponse = "I apologize, but I'm having trouble processing your request right now. This is likely due to our system being in alpha development. Please try rephrasing your question or try again in a moment."
      
      return new Response(JSON.stringify({
        response: errorResponse,
        conversationId,
        error: true,
        metadata: {
          processing_time_ms: processingTime,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'The AI assistant is temporarily unavailable. Please try again later.',
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