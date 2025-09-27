import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/crm/dashboard - Get CRM dashboard statistics and recent activity
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    // Get lead statistics
    const { data: leadStats, error: leadError } = await supabase
      .from('lead_contacts')
      .select('lead_status, source, created_at, lead_score')
      .gte('created_at', startDate.toISOString());
    
    if (leadError) {
      console.error('Error fetching lead stats:', leadError);
      return NextResponse.json({ error: 'Failed to fetch lead statistics' }, { status: 500 });
    }
    
    // Calculate basic statistics
    const totalLeads = leadStats.length;
    const qualifiedLeads = leadStats.filter(lead => 
      ['qualified', 'opportunity', 'proposal', 'negotiation'].includes(lead.lead_status)
    ).length;
    const averageLeadScore = leadStats.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / totalLeads || 0;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    
    // Get conversation statistics
    const { data: conversationStats, error: convError } = await supabase
      .from('conversation_analytics')
      .select('session_id, total_messages, user_engagement_score, demo_requested, partnership_assessment_completed, conversion_stage')
      .gte('last_updated', startDate.toISOString());
    
    if (convError) {
      console.error('Error fetching conversation stats:', convError);
    }
    
    const activeConversations = conversationStats?.length || 0;
    const avgEngagementScore = conversationStats?.reduce((sum, conv) => sum + (conv.user_engagement_score || 0), 0) / activeConversations || 0;
    
    // Get partnership assessment statistics
    const { data: assessmentStats, error: assessError } = await supabase
      .from('partnership_assessments')
      .select('id, assessment_score, readiness_level, submitted_at')
      .gte('submitted_at', startDate.toISOString());
    
    if (assessError) {
      console.error('Error fetching assessment stats:', assessError);
    }
    
    const partnershipAssessments = assessmentStats?.length || 0;
    
    // Get recent activities
    const { data: recentActivities, error: activityError } = await supabase
      .from('contact_interactions')
      .select(`
        id,
        interaction_type,
        interaction_date,
        outcome,
        sentiment,
        interaction_score,
        lead_contacts!inner(name, organization)
      `)
      .order('interaction_date', { ascending: false })
      .limit(10);
    
    if (activityError) {
      console.error('Error fetching recent activities:', activityError);
    }
    
    // Get lead source distribution
    const sourceDistribution = leadStats.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get lead status distribution
    const statusDistribution = leadStats.reduce((acc, lead) => {
      acc[lead.lead_status] = (acc[lead.lead_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get monthly trends
    const monthlyTrends = {};
    leadStats.forEach(lead => {
      const month = new Date(lead.created_at).toISOString().substring(0, 7); // YYYY-MM format
      monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
    });
    
    // Get upcoming tasks
    const { data: upcomingTasks, error: taskError } = await supabase
      .from('follow_up_tasks')
      .select(`
        id,
        task_title,
        due_date,
        priority,
        status,
        lead_contacts!inner(name, organization)
      `)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(10);
    
    if (taskError) {
      console.error('Error fetching upcoming tasks:', taskError);
    }
    
    // Format response data
    const dashboardData = {
      statistics: {
        totalLeads,
        qualifiedLeads,
        activeConversations,
        partnershipAssessments,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgEngagementScore: Math.round(avgEngagementScore * 100) / 100,
        avgLeadScore: Math.round(averageLeadScore)
      },
      distributions: {
        bySource: sourceDistribution,
        byStatus: statusDistribution,
        monthlyTrends
      },
      recentActivities: recentActivities?.map(activity => ({
        id: activity.id,
        type: activity.interaction_type,
        contactName: activity.lead_contacts.name,
        organization: activity.lead_contacts.organization,
        timestamp: activity.interaction_date,
        outcome: activity.outcome,
        sentiment: activity.sentiment,
        score: activity.interaction_score,
        priority: activity.interaction_score > 50 ? 'high' : 
                 activity.interaction_score > 25 ? 'medium' : 'low'
      })) || [],
      upcomingTasks: upcomingTasks?.map(task => ({
        id: task.id,
        title: task.task_title,
        contactName: task.lead_contacts.name,
        organization: task.lead_contacts.organization,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status
      })) || []
    };
    
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}