import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userMessage, botResponse, timestamp, metadata = {} } = await request.json()

    if (!sessionId || !userMessage || !botResponse) {
      return NextResponse.json(
        { error: 'Session ID, user message, and bot response are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // First, get or create conversation session
    const { data: sessionData, error: sessionError } = await supabase
      .rpc('get_or_create_conversation_session', {
        p_session_identifier: sessionId,
        p_user_id: null // Will be null for anonymous AIVY sessions initially
      })

    if (sessionError) {
      console.error('Error creating/getting session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create conversation session' },
        { status: 500 }
      )
    }

    const conversationSessionId = sessionData

    // Save the conversation turn
    const { data: conversationTurn, error: turnError } = await supabase
      .from('conversation_turns')
      .insert({
        session_id: conversationSessionId,
        user_query: userMessage,
        response_content: botResponse,
        intent_analysis: {
          timestamp,
          platform: 'aivy',
          ...metadata
        },
        knowledge_sources: [],
        response_metrics: {
          wordCount: botResponse.split(' ').length,
          executiveAppropriate: 1,
          conversationalFlow: 1,
          actionOriented: botResponse.includes('demo') || botResponse.includes('schedule') ? 1 : 0,
          strategicInsight: botResponse.includes('partnership') || botResponse.includes('AI') ? 1 : 0
        }
      })
      .select('id')
      .single()

    if (turnError) {
      console.error('Error saving conversation turn:', turnError)
      return NextResponse.json(
        { error: 'Failed to save conversation turn' },
        { status: 500 }
      )
    }

    // Update conversation analytics
    await updateConversationAnalytics(supabase, conversationSessionId, userMessage, botResponse)

    return NextResponse.json({ 
      success: true, 
      conversationTurnId: conversationTurn.id,
      sessionId: conversationSessionId
    })
  } catch (error) {
    console.error('Error tracking conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateConversationAnalytics(
  supabase: any, 
  sessionId: string, 
  userMessage: string, 
  botResponse: string
) {
  try {
    // Get existing analytics or create new one
    const { data: existingAnalytics, error: fetchError } = await supabase
      .from('conversation_analytics')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
      console.error('Error fetching analytics:', fetchError)
      return
    }

    const topics = extractTopics(userMessage, botResponse)
    const painPoints = extractPainPoints(userMessage)
    const buyingSignals = countBuyingSignals(userMessage, botResponse)
    
    const analyticsData = {
      session_id: sessionId,
      total_messages: (existingAnalytics?.total_messages || 0) + 1,
      conversation_duration_minutes: Math.floor((Date.now() - new Date(existingAnalytics?.last_updated || Date.now()).getTime()) / 60000),
      user_engagement_score: calculateEngagementScore(userMessage, botResponse),
      topics_covered: [...new Set([...(existingAnalytics?.topics_covered || []), ...topics])],
      pain_points_mentioned: [...new Set([...(existingAnalytics?.pain_points_mentioned || []), ...painPoints])],
      buying_signals: (existingAnalytics?.buying_signals || 0) + buyingSignals,
      demo_requested: (existingAnalytics?.demo_requested || false) || userMessage.toLowerCase().includes('demo'),
      contact_info_provided: (existingAnalytics?.contact_info_provided || false), // Will be set when contact is created
      meeting_requested: (existingAnalytics?.meeting_requested || false) || userMessage.toLowerCase().includes('meeting') || userMessage.toLowerCase().includes('schedule'),
      pricing_discussed: (existingAnalytics?.pricing_discussed || false) || userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost'),
      technical_questions: (existingAnalytics?.technical_questions || 0) + (userMessage.toLowerCase().includes('how') || userMessage.toLowerCase().includes('integrate') ? 1 : 0),
      business_questions: (existingAnalytics?.business_questions || 0) + (userMessage.toLowerCase().includes('business') || userMessage.toLowerCase().includes('roi') ? 1 : 0),
      last_updated: new Date().toISOString()
    }

    if (existingAnalytics) {
      await supabase
        .from('conversation_analytics')
        .update(analyticsData)
        .eq('session_id', sessionId)
    } else {
      await supabase
        .from('conversation_analytics')
        .insert(analyticsData)
    }
  } catch (error) {
    console.error('Error updating conversation analytics:', error)
  }
}

function extractTopics(userMessage: string, botResponse: string): string[] {
  const topics = []
  const text = (userMessage + ' ' + botResponse).toLowerCase()
  
  if (text.includes('partnership') || text.includes('partner')) topics.push('Partnership Program')
  if (text.includes('ai') || text.includes('artificial intelligence')) topics.push('AI Technology')
  if (text.includes('pricing') || text.includes('cost')) topics.push('Pricing')
  if (text.includes('demo') || text.includes('trial')) topics.push('Demo/Trial')
  if (text.includes('feature') || text.includes('capability')) topics.push('Platform Features')
  if (text.includes('support') || text.includes('training')) topics.push('Support & Training')
  if (text.includes('integration')) topics.push('Integration')
  if (text.includes('alpha') || text.includes('development')) topics.push('Alpha Development')
  if (text.includes('education') || text.includes('learning')) topics.push('Educational Technology')
  
  return topics
}

function extractPainPoints(userMessage: string): string[] {
  const painPoints = []
  const text = userMessage.toLowerCase()
  
  if (text.includes('difficult') || text.includes('challenge') || text.includes('problem')) {
    painPoints.push('Implementation Challenges')
  }
  if (text.includes('expensive') || text.includes('budget') || text.includes('cost')) {
    painPoints.push('Budget Constraints')
  }
  if (text.includes('time') || text.includes('timeline') || text.includes('urgent')) {
    painPoints.push('Time Constraints')
  }
  if (text.includes('staff') || text.includes('training') || text.includes('learn')) {
    painPoints.push('Staff Training Needs')
  }
  
  return painPoints
}

function countBuyingSignals(userMessage: string, botResponse: string): number {
  let signals = 0
  const text = userMessage.toLowerCase()
  
  if (text.includes('when can') || text.includes('how soon')) signals++
  if (text.includes('demo') || text.includes('trial')) signals++
  if (text.includes('price') || text.includes('cost')) signals++
  if (text.includes('contract') || text.includes('agreement')) signals++
  if (text.includes('implement') || text.includes('start')) signals++
  if (text.includes('budget') || text.includes('approved')) signals++
  
  return signals
}

function calculateEngagementScore(userMessage: string, botResponse: string): number {
  let score = 0.5 // Base score
  
  // Message length indicates engagement
  if (userMessage.length > 50) score += 0.1
  if (userMessage.length > 100) score += 0.1
  
  // Questions indicate engagement
  if (userMessage.includes('?')) score += 0.1
  
  // Multiple sentences indicate thoughtful engagement
  if (userMessage.split('.').length > 1) score += 0.1
  
  // Specific topics indicate serious interest
  if (userMessage.toLowerCase().includes('partnership') || 
      userMessage.toLowerCase().includes('demo') ||
      userMessage.toLowerCase().includes('pricing')) {
    score += 0.2
  }
  
  return Math.min(1.0, score)
}