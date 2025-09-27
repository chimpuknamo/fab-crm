'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Filter,
  Download,
  Plus
} from 'lucide-react'

interface DashboardStats {
  totalLeads: number
  qualifiedLeads: number
  activeConversations: number
  partnershipAssessments: number
  conversionRate: number
  avgEngagementScore: number
}

interface RecentActivity {
  id: string
  type: 'lead_created' | 'assessment_completed' | 'conversation_started' | 'follow_up_due'
  contactName: string
  organization: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  details: string
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    qualifiedLeads: 0,
    activeConversations: 0,
    partnershipAssessments: 0,
    conversionRate: 0,
    avgEngagementScore: 0
  })

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/crm/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      
      setStats({
        totalLeads: data.statistics.totalLeads,
        qualifiedLeads: data.statistics.qualifiedLeads,
        activeConversations: data.statistics.activeConversations,
        partnershipAssessments: data.statistics.partnershipAssessments,
        conversionRate: data.statistics.conversionRate,
        avgEngagementScore: data.statistics.avgEngagementScore
      })

      setRecentActivities(data.recentActivities || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Fallback to mock data on error
      setStats({
        totalLeads: 128,
        qualifiedLeads: 47,
        activeConversations: 23,
        partnershipAssessments: 15,
        conversionRate: 18.5,
        avgEngagementScore: 0.73
      })

      setRecentActivities([
        {
          id: '1',
          type: 'assessment_completed',
          contactName: 'Dr. Sarah Johnson',
          organization: 'Springfield University',
          timestamp: '2025-01-27T10:30:00Z',
          priority: 'high',
          details: 'Completed partnership assessment - Strategic partnership interest'
        },
        {
          id: '2',
          type: 'lead_created',
          contactName: 'Michael Chen',
          organization: 'Metro Community College',
          timestamp: '2025-01-27T09:15:00Z',
          priority: 'medium',
          details: 'New lead from AIVY chat conversation'
        },
        {
          id: '3',
          type: 'follow_up_due',
          contactName: 'Prof. Emily Rodriguez',
          organization: 'Tech Institute',
          timestamp: '2025-01-27T08:00:00Z',
          priority: 'urgent',
          details: 'Follow-up call scheduled for demo discussion'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment_completed': return <Target className="w-4 h-4" />
      case 'lead_created': return <Users className="w-4 h-4" />
      case 'conversation_started': return <MessageSquare className="w-4 h-4" />
      case 'follow_up_due': return <Clock className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1F504B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM Dashboard...</p>
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
            <h1 className="text-3xl font-bold text-[#1F504B]">CRM Dashboard</h1>
            <p className="text-[#1F504B]/70 mt-1">
              AIVY Lead Management & Partnership Analytics
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <Link
              href="/admin/crm/contacts/new"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white rounded-lg hover:from-[#5A8A84] hover:to-[#1F504B] transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-[#1F504B]">{stats.totalLeads}</p>
            </div>
            <div className="w-12 h-12 bg-[#1F504B]/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-[#1F504B]" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
              <p className="text-2xl font-bold text-[#5A8A84]">{stats.qualifiedLeads}</p>
            </div>
            <div className="w-12 h-12 bg-[#5A8A84]/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#5A8A84]" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Chats</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeConversations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessments</p>
              <p className="text-2xl font-bold text-purple-600">{stats.partnershipAssessments}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-indigo-600">{(stats.avgEngagementScore * 100).toFixed(0)}%</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1F504B] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/crm/contacts"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-[#1F504B]" />
                <span className="font-medium">Manage Contacts</span>
              </div>
              <span className="text-sm text-gray-500">{stats.totalLeads} total</span>
            </Link>

            <Link
              href="/admin/crm/assessments"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Partnership Assessments</span>
              </div>
              <span className="text-sm text-gray-500">{stats.partnershipAssessments} completed</span>
            </Link>

            <Link
              href="/admin/crm/conversations"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="font-medium">AIVY Conversations</span>
              </div>
              <span className="text-sm text-gray-500">{stats.activeConversations} active</span>
            </Link>

            <Link
              href="/admin/crm/analytics"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span className="font-medium">Analytics & Reports</span>
              </div>
              <span className="text-sm text-gray-500">View insights</span>
            </Link>

            <Link
              href="/admin/crm/tasks"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Follow-up Tasks</span>
              </div>
              <span className="text-sm text-gray-500">Manage pipeline</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1F504B]">Recent Activity</h3>
            <Link href="/admin/crm/activity" className="text-sm text-[#5A8A84] hover:text-[#1F504B]">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-full ${getPriorityColor(activity.priority)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.contactName} • {activity.organization}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(activity.priority)}`}>
                      {activity.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}