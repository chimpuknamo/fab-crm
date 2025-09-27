import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings/local-embeddings'
import { generateRAGResponse } from '@/lib/ai/gemini'
import { AIVYConversationMemory } from '@/lib/ai/conversation-memory'
import { ExecutiveKnowledgePrioritizer } from '@/lib/ai/executive-knowledge-prioritizer'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, userId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Initialize services
    const supabase = createServiceClient()
    const conversationMemory = new AIVYConversationMemory()
    
    // Get or create conversation session with proper identifier format
    let sessionIdentifier = conversationId
    
    // Handle legacy UUID format or create new session identifier
    if (!sessionIdentifier || sessionIdentifier === 'default' || sessionIdentifier.includes('-')) {
      // Generate a new AIVY-compatible session identifier
      sessionIdentifier = AIVYConversationMemory.generateSessionIdentifier()
    }
    
    const sessionId = await conversationMemory.getOrCreateSession(sessionIdentifier, userId)
    
    // Get conversation context for executive-level processing
    const context = await conversationMemory.getSessionContext(sessionId)

    // Generate embedding for the user query
    console.log('Generating embedding for query:', message.substring(0, 100) + '...')
    const queryEmbedding = await generateEmbedding(message)
    console.log('Generated embedding with dimensions:', queryEmbedding.length)

    // Perform vector search for relevant context
    console.log('Performing vector search with threshold: 0.7, match_count: 5, min_length: 200')
    const { data: relevantChunks, error: searchError } = await supabase
      .rpc('match_documents', {
        query_embedding: queryEmbedding,
        similarity_threshold: 0.7,
        match_count: 5,
        min_content_length: 200
      })

    if (searchError) {
      console.error('Vector search error:', searchError)
    }
    
    console.log('Found relevant chunks:', relevantChunks?.length || 0)
    if (relevantChunks?.length > 0) {
      console.log('Top similarity scores:', relevantChunks.slice(0, 2).map(chunk => chunk.similarity))
    }

    // If no results found with high threshold, try with lower threshold
    let finalRelevantChunks = relevantChunks
    if (!relevantChunks || relevantChunks.length === 0) {
      console.log('No chunks found with threshold 0.7, trying with 0.5...')
      const { data: fallbackChunks, error: fallbackError } = await supabase
        .rpc('match_documents', {
          query_embedding: queryEmbedding,
          similarity_threshold: 0.5,
          match_count: 5,
          min_content_length: 150  // Slightly lower minimum for fallback
        })
      
      if (fallbackError) {
        console.error('Fallback vector search error:', fallbackError)
      } else {
        finalRelevantChunks = fallbackChunks
        console.log('Found fallback chunks:', fallbackChunks?.length || 0)
        if (fallbackChunks?.length > 0) {
          console.log('Fallback similarity scores:', fallbackChunks.slice(0, 2).map(chunk => chunk.similarity))
        }
      }
    }
    
    // Analyze user intent using AIVY's executive intelligence
    const intentAnalysis = await conversationMemory.analyzeIntent(message, context)
    console.log('Intent analysis:', intentAnalysis.primaryIntent, 'confidence:', intentAnalysis.confidence)
    
    // Apply executive-level knowledge prioritization to retrieved chunks
    if (finalRelevantChunks && finalRelevantChunks.length > 0) {
      const executiveContext = {
        profile: context.executiveProfile,
        state: context.conversationState,
        intent: intentAnalysis
      }
      
      finalRelevantChunks = ExecutiveKnowledgePrioritizer.prioritizeForExecutive(
        finalRelevantChunks.map(chunk => ({
          content: chunk.content,
          similarity: chunk.similarity
        })),
        executiveContext
      )
      
      console.log('Applied executive prioritization to', finalRelevantChunks.length, 'chunks')
    }

    // Generate response using Gemini with RAG and executive context
    // Convert conversation history to format expected by RAG
    const conversationHistory = context.recentHistory.map(turn => ({
      role: 'user',
      content: `${turn.userQuery} | Response: ${turn.responseContent}`
    }))
    
    const response = await generateRAGResponse({
      query: message,
      relevantChunks: finalRelevantChunks || [],
      conversationHistory,
      executiveContext: {
        profile: context.executiveProfile,
        state: context.conversationState,
        intent: intentAnalysis
      }
    })
    
    // Save conversation turn to AIVY memory system
    await conversationMemory.saveConversationTurn(
      sessionId,
      message,
      response,
      intentAnalysis,
      finalRelevantChunks || []
    )

    // Log analytics (optional)
    try {
      await supabase
        .from('ai_analytics')
        .insert({
          event_type: 'chat_message',
          user_id: userId || null,
          session_id: conversationId,
          metadata: {
            message_length: message.length,
            response_length: response.length,
            timestamp: new Date().toISOString()
          }
        })
    } catch (analyticsError) {
      console.warn('Failed to log analytics:', analyticsError)
      // Don't fail the request if analytics logging fails
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    return NextResponse.json({
      response,
      conversationId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
}