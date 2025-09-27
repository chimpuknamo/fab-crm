import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/crm/tasks - Get all follow-up tasks with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const dueDateFilter = searchParams.get('dueDateFilter'); // 'overdue', 'today', 'upcoming'
    const sortBy = searchParams.get('sortBy') || 'due_date';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    let query = supabase
      .from('follow_up_tasks')
      .select(`
        id,
        task_type,
        task_title,
        task_description,
        due_date,
        priority,
        status,
        assigned_to,
        created_by,
        completed_at,
        result,
        created_at,
        lead_contacts!inner(
          id,
          name,
          email,
          phone,
          organization,
          role,
          lead_status,
          lead_score
        )
      `)
      .range((page - 1) * pageSize, page * pageSize - 1);
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    
    // Date filters
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (dueDateFilter === 'overdue') {
      query = query.lt('due_date', today.toISOString()).neq('status', 'completed');
    } else if (dueDateFilter === 'today') {
      query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString());
    } else if (dueDateFilter === 'upcoming') {
      query = query.gte('due_date', tomorrow.toISOString());
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    const { data: tasks, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
    
    // Get count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('follow_up_tasks')
      .select('*', { count: 'exact', head: true });
    
    // Get task statistics
    const { data: stats, error: statsError } = await supabase
      .from('follow_up_tasks')
      .select('status, priority, due_date');
    
    let taskStats = {
      total: stats?.length || 0,
      pending: stats?.filter(t => t.status === 'pending').length || 0,
      in_progress: stats?.filter(t => t.status === 'in_progress').length || 0,
      completed: stats?.filter(t => t.status === 'completed').length || 0,
      overdue: stats?.filter(t => t.status !== 'completed' && new Date(t.due_date) < now).length || 0,
      high_priority: stats?.filter(t => t.priority === 'high' || t.priority === 'urgent').length || 0
    };
    
    return NextResponse.json({
      tasks,
      statistics: taskStats,
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

// POST /api/crm/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const data = await request.json();
    
    const { data: task, error } = await supabase
      .from('follow_up_tasks')
      .insert([{
        contact_id: data.contact_id,
        task_type: data.task_type,
        task_title: data.task_title,
        task_description: data.task_description,
        due_date: data.due_date,
        priority: data.priority || 'medium',
        status: data.status || 'pending',
        assigned_to: data.assigned_to,
        created_by: data.created_by
      }])
      .select(`
        *,
        lead_contacts!inner(name, email, organization)
      `)
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
    
    return NextResponse.json({ task });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/crm/tasks/[id] - Update task
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const data = await request.json();
    const url = new URL(request.url);
    const taskId = url.pathname.split('/').pop();
    
    // Prepare update data
    const updateData: any = { ...data };
    
    // Set completed_at if marking as completed
    if (data.status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { data: task, error } = await supabase
      .from('follow_up_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        lead_contacts!inner(name, email, organization)
      `)
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
    
    return NextResponse.json({ task });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}