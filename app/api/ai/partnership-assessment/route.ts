import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { AIVYConversationMemory } from '@/lib/ai/conversation-memory'

interface PartnershipAssessmentData {
  // Institution Information
  institutionName: string
  institutionType: string
  campusCount: number
  studentPopulation: number
  
  // Strategic Contact Information
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  primaryContactRole: string
  
  // Co-Development Partnership Details
  currentTechEcosystem: string
  strategicChallenges: string
  investmentTimeline: string
  partnershipCommitmentLevel: string
  
  // Custom Requirements & Vision
  customRequirements: string
  visionStatement: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentData, conversationId, userId, contactId }: {
      assessmentData: PartnershipAssessmentData
      conversationId: string
      userId?: string
      contactId?: string
    } = body

    if (!assessmentData || !assessmentData.institutionName || !assessmentData.primaryContactName) {
      return NextResponse.json(
        { error: 'Assessment data with institution name and contact name is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const conversationMemory = new AIVYConversationMemory()
    
    // Get or create session
    const sessionIdentifier = conversationId || AIVYConversationMemory.generateSessionIdentifier()
    const sessionId = await conversationMemory.getOrCreateSession(sessionIdentifier, userId)
    
    // Get or determine contact ID
    let finalContactId = contactId
    if (!finalContactId) {
      // Try to get existing contact from session
      const existingContact = await conversationMemory.getLeadContact(sessionId)
      if (existingContact) {
        finalContactId = existingContact.id
      } else {
        // Create new lead contact from assessment data
        const newContactData = {
          name: assessmentData.primaryContactName,
          phone: assessmentData.primaryContactPhone || 'Not provided',
          email: assessmentData.primaryContactEmail,
          organization: assessmentData.institutionName,
          role: assessmentData.primaryContactRole
        }
        finalContactId = await conversationMemory.createLeadContact(sessionId, newContactData)
      }
    }

    if (!finalContactId) {
      throw new Error('Failed to determine or create contact')
    }

    // Create partnership assessment using database function
    const { data: assessmentId, error } = await supabase
      .rpc('create_partnership_assessment', {
        p_contact_id: finalContactId,
        p_session_id: sessionId,
        p_assessment_data: {
          institution_name: assessmentData.institutionName,
          institution_type: assessmentData.institutionType,
          campus_count: assessmentData.campusCount,
          student_population: assessmentData.studentPopulation,
          primary_contact_name: assessmentData.primaryContactName,
          primary_contact_email: assessmentData.primaryContactEmail,
          primary_contact_phone: assessmentData.primaryContactPhone,
          primary_contact_role: assessmentData.primaryContactRole,
          current_tech_ecosystem: assessmentData.currentTechEcosystem,
          strategic_challenges: assessmentData.strategicChallenges,
          investment_timeline: assessmentData.investmentTimeline,
          partnership_commitment_level: assessmentData.partnershipCommitmentLevel,
          custom_requirements: assessmentData.customRequirements || null,
          vision_statement: assessmentData.visionStatement || null
        }
      })

    if (error) {
      throw new Error(`Failed to create assessment: ${error.message}`)
    }

    // Get the created assessment with calculated score
    const { data: assessment, error: fetchError } = await supabase
      .from('partnership_assessments')
      .select('*, assessment_score, readiness_level, partnership_priority')
      .eq('id', assessmentId)
      .single()

    if (fetchError) {
      console.warn('Failed to fetch assessment details:', fetchError)
    }

    return NextResponse.json({
      success: true,
      assessmentId,
      contactId: finalContactId,
      sessionId,
      assessmentScore: assessment?.assessment_score || 0,
      readinessLevel: assessment?.readiness_level || 'initial',
      partnershipPriority: assessment?.partnership_priority || 'medium',
      message: 'Partnership assessment created successfully'
    })

  } catch (error) {
    console.error('Partnership assessment creation error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}