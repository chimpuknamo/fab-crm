import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/crm/contacts/[id] - Get specific contact with full details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = params;
    
    // Get contact with all related data
    const { data: contact, error } = await supabase
      .from('lead_contacts')
      .select(`
        *,
        partnership_assessments(*),
        conversation_analytics(*),
        contact_interactions(
          *, 
          conversation_sessions(id, created_at, updated_at)
        ),
        follow_up_tasks(*),
        contact_tags(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
      console.error('Error fetching contact:', error);
      return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
    }
    
    // Get conversation sessions with message details
    const { data: conversations, error: convError } = await supabase
      .from('conversation_sessions')
      .select(`
        *,
        messages!inner(id, role, content, created_at),
        conversation_analytics(*)
      `)
      .eq('lead_contact_id', id)
      .order('created_at', { ascending: false });
    
    if (convError) {
      console.error('Error fetching conversations:', convError);
    }
    
    // Get recent activity timeline
    const { data: activities, error: actError } = await supabase
      .from('contact_interactions')
      .select('*')
      .eq('contact_id', id)
      .order('interaction_date', { ascending: false })
      .limit(10);
    
    if (actError) {
      console.error('Error fetching activities:', actError);
    }
    
    return NextResponse.json({
      contact,
      conversations: conversations || [],
      activities: activities || []
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/crm/contacts/[id] - Update specific contact
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = params;
    const data = await request.json();
    
    // Update contact
    const { data: contact, error } = await supabase
      .from('lead_contacts')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating contact:', error);
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
    
    // Recalculate lead score if relevant fields changed
    const scoreFields = ['role', 'company_size', 'industry', 'lead_status'];
    const shouldRecalculateScore = scoreFields.some(field => data.hasOwnProperty(field));
    
    if (shouldRecalculateScore) {
      await supabase.rpc('calculate_lead_score', { p_contact_id: id });
    }
    
    return NextResponse.json({ contact });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/crm/contacts/[id] - Delete contact
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = params;
    
    const { error } = await supabase
      .from('lead_contacts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting contact:', error);
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Contact deleted successfully' });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}