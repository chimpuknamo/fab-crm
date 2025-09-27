import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/crm/contacts - Get all contacts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    let query = supabase
      .from('lead_contacts')
      .select(`
        *,
        partnership_assessments!inner(id, assessment_score, readiness_level, submitted_at),
        conversation_analytics(
          session_id, total_messages, conversation_duration_minutes, 
          user_engagement_score, demo_requested, partnership_assessment_completed,
          conversion_stage
        ),
        contact_interactions(id, interaction_type, interaction_date, sentiment),
        follow_up_tasks!inner(id, status, due_date, priority)
      `)
      .range((page - 1) * pageSize, page * pageSize - 1);
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('lead_status', status);
    }
    
    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%, email.ilike.%${search}%, organization.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    const { data: contacts, error, count } = await query;
    
    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
    
    // Get count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('lead_contacts')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      contacts,
      pagination: {
        page,
        pageSize,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / pageSize)
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crm/contacts - Create new contact
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const data = await request.json();
    
    const { data: contact, error } = await supabase
      .from('lead_contacts')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        organization: data.organization,
        role: data.role,
        lead_status: data.status || 'new',
        source: data.source || 'manual',
        company_size: data.company_size,
        industry: data.industry,
        job_function: data.job_function,
        notes: data.notes,
        company_website: data.website,
        social_links: data.social_links || {},
        metadata: {
          created_via: 'admin_panel',
          created_by: 'admin'
        }
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contact:', error);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
    
    // Calculate initial lead score
    const { data: scoreResult } = await supabase
      .rpc('calculate_lead_score', { p_contact_id: contact.id });
    
    return NextResponse.json({ contact, score: scoreResult });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/crm/contacts/[id] - Update contact
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const data = await request.json();
    const url = new URL(request.url);
    const contactId = url.pathname.split('/').pop();
    
    const { data: contact, error } = await supabase
      .from('lead_contacts')
      .update(data)
      .eq('id', contactId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating contact:', error);
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
    
    // Recalculate lead score if relevant fields changed
    if (data.role || data.company_size || data.industry) {
      await supabase.rpc('calculate_lead_score', { p_contact_id: contactId });
    }
    
    return NextResponse.json({ contact });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}