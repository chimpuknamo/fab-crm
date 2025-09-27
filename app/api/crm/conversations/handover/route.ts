import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Request handover from AIVY to human agent
export async function POST(request: NextRequest) {
  try {
    const { 
      sessionId, 
      contactId, 
      reason, 
      urgency = 'medium',
      specialInstructions,
      requestedBy = 'user' // 'user' or 'aivy'
    } = await request.json()

    if (!sessionId || !contactId || !reason) {
      return NextResponse.json(
        { error: 'Session ID, contact ID, and reason are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get conversation history and analytics
    const [conversationHistory, analytics, contactInfo] = await Promise.all([
      getConversationHistory(supabase, sessionId),
      getConversationAnalytics(supabase, sessionId),
      getContactInfo(supabase, contactId)
    ])

    if (!contactInfo) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    // Create comprehensive handover task
    const handoverSummary = await createHandoverSummary(
      conversationHistory, 
      analytics, 
      contactInfo,
      reason,
      specialInstructions
    )

    const { data: handoverTask, error: taskError } = await supabase
      .from('follow_up_tasks')
      .insert({
        contact_id: contactId,
        task_type: 'follow_up',
        task_title: `🤖 AIVY Handover: ${contactInfo.name} - ${reason}`,
        task_description: handoverSummary,
        due_date: calculateDueDate(urgency),
        priority: urgency === 'urgent' ? 'urgent' : urgency === 'high' ? 'high' : 'medium',
        status: 'pending',
        created_by: null // System created
      })
      .select()
      .single()

    if (taskError) {
      console.error('Error creating handover task:', taskError)
      return NextResponse.json(
        { error: 'Failed to create handover task' },
        { status: 500 }
      )
    }

    // Create handover interaction record
    await supabase
      .from('contact_interactions')
      .insert({
        contact_id: contactId,
        session_id: sessionId,
        interaction_type: 'follow_up',
        interaction_date: new Date().toISOString(),
        outcome: 'Handover to human agent requested',
        sentiment: 'neutral',
        topics_discussed: analytics?.topics_covered || [],
        action_items: [
          'Review AIVY conversation history',
          'Address specific customer needs',
          `Handle request: ${reason}`
        ],
        next_steps: specialInstructions || 'Follow up with personalized human assistance',
        metadata: {
          handover_reason: reason,
          urgency,
          requested_by: requestedBy,
          aivy_session_id: sessionId,
          conversation_score: analytics?.user_engagement_score,
          buying_signals: analytics?.buying_signals
        }
      })

    // Update conversation analytics to mark as handed over
    await supabase
      .from('conversation_analytics')
      .update({
        conversion_stage: 'evaluation', // Move to next stage
        last_updated: new Date().toISOString()
      })
      .eq('session_id', sessionId)

    // Update contact lead status if high intent
    if (analytics?.buying_signals > 2 || analytics?.demo_requested || analytics?.meeting_requested) {
      await supabase
        .from('lead_contacts')
        .update({
          lead_status: 'qualified',
          last_contact_date: new Date().toISOString()
        })
        .eq('id', contactId)
    }

    return NextResponse.json({
      success: true,
      handoverTask,
      message: 'Conversation successfully handed over to human agent',
      estimatedResponseTime: getEstimatedResponseTime(urgency)
    })
  } catch (error) {
    console.error('Error in handover request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getConversationHistory(supabase: any, sessionId: string) {
  const { data } = await supabase
    .rpc('get_conversation_history', {
      p_session_id: sessionId,
      p_limit: 50
    })
  return data || []
}

async function getConversationAnalytics(supabase: any, sessionId: string) {
  const { data } = await supabase
    .from('conversation_analytics')
    .select('*')
    .eq('session_id', sessionId)
    .single()
  return data
}

async function getContactInfo(supabase: any, contactId: string) {
  const { data } = await supabase
    .from('lead_contacts')
    .select('*')
    .eq('id', contactId)
    .single()
  return data
}

async function createHandoverSummary(
  conversationHistory: any[],
  analytics: any,
  contact: any,
  reason: string,
  specialInstructions?: string
): Promise<string> {
  const summary = `
🤖 AIVY CONVERSATION HANDOVER REPORT

📞 CONTACT INFORMATION:
Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone || 'Not provided'}
Company: ${contact.company || 'Not specified'}
Role: ${contact.role || 'Not specified'}
Lead Status: ${contact.lead_status}
Lead Score: ${contact.lead_score || 0}

📊 CONVERSATION ANALYTICS:
Total Messages: ${analytics?.total_messages || 0}
Engagement Score: ${(analytics?.user_engagement_score * 100).toFixed(1)}%
Conversation Duration: ${analytics?.conversation_duration_minutes || 0} minutes
Buying Signals: ${analytics?.buying_signals || 0}
Conversion Stage: ${analytics?.conversion_stage || 'awareness'}

🎯 KEY INTERESTS & TOPICS:
${analytics?.topics_covered?.map((topic: string) => `• ${topic}`).join('\n') || '• General inquiry'}

⚠️ PAIN POINTS MENTIONED:
${analytics?.pain_points_mentioned?.map((pain: string) => `• ${pain}`).join('\n') || '• None identified'}

🚨 HANDOVER REASON: ${reason}

💡 SPECIAL INSTRUCTIONS:
${specialInstructions || 'No specific instructions provided'}

📋 CONVERSATION HIGHLIGHTS:
${conversationHistory.slice(0, 5).map((turn: any, index: number) => `
Turn ${index + 1}:
👤 User: ${turn.user_query}
🤖 AIVY: ${turn.response_content.slice(0, 200)}${turn.response_content.length > 200 ? '...' : ''}
`).join('\n')}

${conversationHistory.length > 5 ? `\n... and ${conversationHistory.length - 5} more conversation turns (view full history in CRM)` : ''}

🎯 RECOMMENDED NEXT STEPS:
${analytics?.demo_requested ? '• Schedule platform demo' : ''}
${analytics?.meeting_requested ? '• Book discovery meeting' : ''}
${analytics?.pricing_discussed ? '• Provide detailed pricing information' : ''}
${analytics?.buying_signals > 2 ? '• Fast-track to sales process' : ''}
• Review full conversation history in CRM
• Address specific customer needs identified above
• Continue building rapport based on AIVY interaction

⏰ URGENCY: This handover has been marked as ${reason.includes('urgent') || reason.includes('asap') ? 'URGENT' : 'NORMAL'} priority.
  `.trim()

  return summary
}

function calculateDueDate(urgency: string): string {
  const now = new Date()
  switch (urgency) {
    case 'urgent':
      return new Date(now.getTime() + 30 * 60 * 1000).toISOString() // 30 minutes
    case 'high':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    case 'medium':
      return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
    case 'low':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    default:
      return new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
  }
}

function getEstimatedResponseTime(urgency: string): string {
  switch (urgency) {
    case 'urgent':
      return 'Within 30 minutes'
    case 'high':
      return 'Within 2 hours'
    case 'medium':
      return 'Within 8 hours'
    case 'low':
      return 'Within 24 hours'
    default:
      return 'Within 4 hours'
  }
}