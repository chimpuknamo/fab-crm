import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/crm/assessments - Get all partnership assessments with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const status = searchParams.get('status');
    const readinessLevel = searchParams.get('readinessLevel');
    const institutionType = searchParams.get('institutionType');
    const priority = searchParams.get('priority');
    const sortBy = searchParams.get('sortBy') || 'submitted_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    let query = supabase
      .from('partnership_assessments')
      .select(`
        id,
        institution_name,
        institution_type,
        campus_count,
        student_population,
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone,
        primary_contact_role,
        current_tech_ecosystem,
        strategic_challenges,
        investment_timeline,
        partnership_commitment_level,
        custom_requirements,
        vision_statement,
        assessment_score,
        readiness_level,
        partnership_priority,
        submitted_at,
        reviewed_at,
        reviewed_by,
        status,
        created_at,
        updated_at,
        lead_contacts!inner(
          id,
          name,
          email,
          phone,
          organization,
          role,
          lead_status,
          lead_score,
          source
        )
      `)
      .range((page - 1) * pageSize, page * pageSize - 1);
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (readinessLevel && readinessLevel !== 'all') {
      query = query.eq('readiness_level', readinessLevel);
    }
    
    if (institutionType && institutionType !== 'all') {
      query = query.eq('institution_type', institutionType);
    }
    
    if (priority && priority !== 'all') {
      query = query.eq('partnership_priority', priority);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    const { data: assessments, error } = await query;
    
    if (error) {
      console.error('Error fetching assessments:', error);
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }
    
    // Get count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('partnership_assessments')
      .select('*', { count: 'exact', head: true });
    
    // Get assessment statistics
    const { data: stats, error: statsError } = await supabase
      .from('partnership_assessments')
      .select('status, readiness_level, partnership_priority, institution_type, assessment_score');
    
    let assessmentStats = {
      total: stats?.length || 0,
      submitted: stats?.filter(a => a.status === 'submitted').length || 0,
      under_review: stats?.filter(a => a.status === 'under_review').length || 0,
      approved: stats?.filter(a => a.status === 'approved').length || 0,
      high_priority: stats?.filter(a => a.partnership_priority === 'high' || a.partnership_priority === 'critical').length || 0,
      ready_for_partnership: stats?.filter(a => a.readiness_level === 'ready' || a.readiness_level === 'committed').length || 0,
      average_score: stats?.length ? stats.reduce((sum, a) => sum + (a.assessment_score || 0), 0) / stats.length : 0,
      by_institution_type: stats?.reduce((acc, a) => {
        acc[a.institution_type] = (acc[a.institution_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };
    
    return NextResponse.json({
      assessments,
      statistics: assessmentStats,
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

// PATCH /api/crm/assessments/[id] - Update assessment status/review
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const data = await request.json();
    const url = new URL(request.url);
    const assessmentId = url.pathname.split('/').pop();
    
    // Prepare update data
    const updateData: any = { ...data };
    
    // Set reviewed_at if changing status to reviewed
    if ((data.status === 'under_review' || data.status === 'approved' || data.status === 'declined') && !updateData.reviewed_at) {
      updateData.reviewed_at = new Date().toISOString();
    }
    
    const { data: assessment, error } = await supabase
      .from('partnership_assessments')
      .update(updateData)
      .eq('id', assessmentId)
      .select(`
        *,
        lead_contacts!inner(name, email, organization)
      `)
      .single();
    
    if (error) {
      console.error('Error updating assessment:', error);
      return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
    }
    
    return NextResponse.json({ assessment });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}