'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckCircle, 
  Clock, 
  Plus, 
  Filter, 
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  AlertTriangle,
  Trash2,
  Edit,
  MoreHorizontal,
  Search,
  Download
} from 'lucide-react'

interface Task {
  id: string
  contact_id?: string
  task_type: 'call' | 'email' | 'demo' | 'meeting' | 'proposal' | 'follow_up' | 'partnership_review'
  task_title: string
  task_description?: string
  due_date: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to?: string
  created_by?: string
  completed_at?: string
  result?: string
  created_at: string
  lead_contacts?: {
    id: string
    name: string
    email: string
    phone?: string
    organization: string
    role?: string
    lead_status: string
    lead_score?: number
  }
}

interface TaskStatistics {
  total: number
  pending: number
  in_progress: number
  completed: number
  overdue: number
  high_priority: number
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [statistics, setStatistics] = useState<TaskStatistics>({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
    high_priority: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [dueDateFilter, setDueDateFilter] = useState<string>('all')
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchQuery, statusFilter, typeFilter, priorityFilter, dueDateFilter])

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/crm/tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      
      const data = await response.json()
      setTasks(data.tasks || [])
      setFilteredTasks(data.tasks || [])
      setStatistics(data.statistics || {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0,
        high_priority: 0
      })
    } catch (error) {
      console.error('Failed to load tasks:', error)
      // Fallback to empty data on error
      setTasks([])
      setFilteredTasks([])
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.lead_contacts?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.lead_contacts?.organization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.task_description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.task_type === typeFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    if (dueDateFilter !== 'all') {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      filtered = filtered.filter(task => {
        const dueDate = new Date(task.due_date)
        switch (dueDateFilter) {
          case 'overdue':
            return dueDate < today && task.status !== 'completed'
          case 'today':
            return dueDate.toDateString() === today.toDateString()
          case 'tomorrow':
            return dueDate.toDateString() === tomorrow.toDateString()
          case 'this_week':
            return dueDate >= today && dueDate <= nextWeek
          default:
            return true
        }
      })
    }

    setFilteredTasks(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'medium': return <Clock className="w-4 h-4 text-blue-500" />
      case 'low': return <Clock className="w-4 h-4 text-gray-500" />
      default: return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-green-600" />
      case 'email': return <Mail className="w-4 h-4 text-blue-600" />
      case 'demo': return <CheckCircle className="w-4 h-4 text-purple-600" />
      case 'meeting': return <Calendar className="w-4 h-4 text-indigo-600" />
      case 'proposal': return <User className="w-4 h-4 text-orange-600" />
      case 'follow_up': return <Clock className="w-4 h-4 text-teal-600" />
      case 'partnership_review': return <Building className="w-4 h-4 text-pink-600" />
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed'
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/crm/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update task status')
      }
      
      const { task } = await response.json()
      
      // Update local state
      setTasks(tasks.map(t => 
        t.id === taskId ? task : t
      ))
      
      // Reload tasks to get updated statistics
      loadTasks()
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  // Use statistics from API instead of calculating locally
  const stats = {
    totalTasks: statistics.total,
    pendingTasks: statistics.pending,
    overdueTasks: statistics.overdue,
    completedTasks: statistics.completed
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1F504B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1F504B]">Task Management</h1>
            <p className="text-[#1F504B]/70 mt-1">
              {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white rounded-lg hover:from-[#5A8A84] hover:to-[#1F504B] transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-[#1F504B]">{stats.totalTasks}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-[#5A8A84]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="demo">Demo</option>
              <option value="meeting">Meeting</option>
              <option value="proposal">Proposal</option>
              <option value="follow_up">Follow-up</option>
              <option value="partnership_review">Partnership Review</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
            >
              <option value="all">All Due Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white p-6 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
              isOverdue(task.due_date, task.status) ? 'border-red-200 bg-red-50/50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getTypeIcon(task.task_type)}
                  <h3 className="text-lg font-semibold text-gray-900">{task.task_title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
                    {getPriorityIcon(task.priority)}
                    <span className="ml-1 capitalize">{task.priority}</span>
                  </span>
                  {isOverdue(task.due_date, task.status) && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded border border-red-200">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      OVERDUE
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-3">{task.task_description || 'No description provided'}</p>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  {task.lead_contacts && (
                    <>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <Link 
                          href={`/admin/crm/contacts/${task.lead_contacts.id}`}
                          className="text-[#5A8A84] hover:text-[#1F504B] font-medium"
                        >
                          {task.lead_contacts.name}
                        </Link>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <span>{task.lead_contacts.organization}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDateTime(task.due_date)}</span>
                  </div>

                  {task.completed_at && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed: {formatDate(task.completed_at)}</span>
                    </div>
                  )}
                </div>

                {task.result && task.status === 'completed' && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Result:</strong> {task.result}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {task.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      disabled={task.status === 'in_progress'}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                    >
                      Complete
                    </button>
                  </>
                )}
                
                <button className="text-gray-400 hover:text-blue-600">
                  <Edit className="w-4 h-4" />
                </button>
                
                <button className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {tasks.length === 0 
                ? "Get started by creating your first task."
                : "Try adjusting your filters to see more results."
              }
            </p>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white rounded-lg hover:from-[#5A8A84] hover:to-[#1F504B] transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </button>
          </div>
        )}
      </div>
    </div>
  )
}