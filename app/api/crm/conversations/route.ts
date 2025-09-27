import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Retrieve conversations with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const contactId = searchParams.get('contactId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') // 'active', 'completed', 'needs_handover'
    
    const supabase = createClient()

    let query = supabase
      .from('conversation_sessions')
      .select(`
        id,
        session_identifier,
        executive_profile,
        conversation_state,
        created_at,
        updated_at,
        last_interaction_at,
        conversation_turns:conversation_turns(
          id,
          user_query,
          response_content,
          intent_analysis,
          created_at
        ),
        conversation_analytics:conversation_analytics(
          total_messages,
          conversation_duration_minutes,
          user_engagement_score,
          topics_covered,
          pain_points_mentioned,
          buying_signals,
          demo_requested,
          contact_info_provided,
          meeting_requested,
          pricing_discussed,
          conversion_stage
        ),
        contact_interactions:contact_interactions!inner(
          contact_id,
          interaction_type,
          outcome,
          sentiment,
          lead_contacts!inner(
            id,
            name,
            email,
            phone,
            company,
            role,
            lead_status,
            lead_score
          )
        )
      `)
      .order('last_interaction_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (sessionId) {
      query = query.eq('id', sessionId)
    }

    if (contactId) {
      query = query.eq('contact_interactions.contact_id', contactId)
    }

    // Filter by conversation status
    if (status === 'active') {
      query = query.gte('last_interaction_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
    } else if (status === 'needs_handover') {
      query = query
        .eq('conversation_analytics.buying_signals', 3) // High buying signals
        .or('conversation_analytics.demo_requested.eq.true,conversation_analytics.meeting_requested.eq.true')
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error in GET /api/crm/conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create interaction record and update conversation status
export async function POST(request: NextRequest) {
  try {
    const { 
      sessionId, 
      contactId, 
      interactionType, 
      outcome, 
      sentiment = 'neutral',
      topicsDiscussed = [],
      actionItems = [],
      nextSteps,
      handoverToHuman = false,
      metadata = {}
    } = await request.json()

    if (!sessionId || !contactId || !interactionType) {
      return NextResponse.json(
        { error: 'Session ID, contact ID, and interaction type are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Create interaction record
    const { data: interaction, error: interactionError } = await supabase
      .from('contact_interactions')
      .insert({
        contact_id: contactId,
        session_id: sessionId,
        interaction_type: interactionType,
        outcome,
        sentiment,
        topics_discussed: topicsDiscussed,
        action_items: actionItems,
        next_steps: nextSteps,
        metadata: {
          ...metadata,
          handover_requested: handoverToHuman,
          created_via: 'aivy_api'
        }
      })
      .select()
      .single()

    if (interactionError) {
      console.error('Error creating interaction:', interactionError)
      return NextResponse.json(
        { error: 'Failed to create interaction record' },
        { status: 500 }
      )
    }

    // If handover to human is requested, create follow-up task
    if (handoverToHuman) {
      await createHandoverTask(supabase, contactId, sessionId, nextSteps, topicsDiscussed)
    }

    // Update conversation analytics to mark contact info as provided
    await supabase
      .from('conversation_analytics')
      .update({
        contact_info_provided: true,
        last_updated: new Date().toISOString()
      })
      .eq('session_id', sessionId)

    return NextResponse.json({
      success: true,
      interaction,
      handoverCreated: handoverToHuman
    })
  } catch (error) {
    console.error('Error in POST /api/crm/conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createHandoverTask(
  supabase: any, 
  contactId: string, 
  sessionId: string, 
  nextSteps?: string,
  topicsDiscussed: string[] = []
) {
  try {
    // Get conversation summary for task description
    const { data: conversationSummary } = await supabase
      .rpc('get_conversation_history', {
        p_session_id: sessionId,
        p_limit: 10
      })

    const taskDescription = `
AIVY Conversation Handover - Contact requires human assistance

Key Discussion Topics: ${topicsDiscussed.join(', ') || 'General inquiry'}

Recent Conversation Summary:
${conversationSummary?.map((turn: any) => 
  `User: ${turn.user_query}\nAIVY: ${turn.response_content}\n---`
).slice(0, 3).join('\n')}

Next Steps: ${nextSteps || 'Follow up on conversation and address specific needs'}

Please review the full conversation history and contact profile before reaching out.
    `.trim()

    await supabase
      .from('follow_up_tasks')
      .insert({
        contact_id: contactId,
        task_type: 'follow_up',
        task_title: 'AIVY Conversation Handover',
        task_description: taskDescription,
        due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        priority: topicsDiscussed.some(topic => 
          topic.toLowerCase().includes('demo') || 
          topic.toLowerCase().includes('pricing') ||
          topic.toLowerCase().includes('partnership')
        ) ? 'high' : 'medium',
        status: 'pending'
      })
  } catch (error) {
    console.error('Error creating handover task:', error)
  }
}