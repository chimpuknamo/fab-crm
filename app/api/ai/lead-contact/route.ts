import { NextRequest, NextResponse } from 'next/server'
import { AIVYConversationMemory } from '@/lib/ai/conversation-memory'
import type { LeadContact } from '@/lib/ai/conversation-memory'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactInfo, conversationId, userId }: {
      contactInfo: LeadContact
      conversationId: string
      userId?: string
    } = body

    if (!contactInfo || !contactInfo.name || !contactInfo.phone) {
      return NextResponse.json(
        { error: 'Contact information with name and phone is required' },
        { status: 400 }
      )
    }

    const conversationMemory = new AIVYConversationMemory()
    
    // Get or create session
    const sessionIdentifier = conversationId || AIVYConversationMemory.generateSessionIdentifier()
    const sessionId = await conversationMemory.getOrCreateSession(sessionIdentifier, userId)
    
    // Create lead contact
    const contactId = await conversationMemory.createLeadContact(sessionId, contactInfo)
    
    if (!contactId) {
      throw new Error('Failed to create lead contact')
    }

    return NextResponse.json({
      success: true,
      contactId,
      sessionId,
      message: 'Lead contact created successfully'
    })

  } catch (error) {
    console.error('Lead contact creation error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}