'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Users,
  Target,
  BarChart3,
  Filter,
  Download,
  Eye,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Phone,
  Mail,
  Building,
  Search,
  ChevronRight
} from 'lucide-react'

interface ConversationAnalytics {
  id: string
  session_id: string
  contact_id?: string
  contact_name?: string
  contact_email?: string
  organization?: string
  total_messages: number
  conversation_duration_minutes: number
  user_engagement_score: number
  intent_distribution: Record<string, number>
  topics_covered: string[]
  pain_points_mentioned: string[]
  buying_signals: number
  objections_raised: string[]
  competitive_mentions: string[]
  demo_requested: boolean
  contact_info_provided: boolean
  meeting_requested: boolean
  pricing_discussed: boolean
  partnership_assessment_completed: boolean
  technical_questions: number
  business_questions: number
  satisfaction_indicators: Record<string, any>
  conversion_stage: 'awareness' | 'interest' | 'consideration' | 'evaluation' | 'decision' | 'partnership'
  last_updated: string
  created_at: string
}

export default function ConversationAnalytics() {
  const [conversations, setConversations] = useState<ConversationAnalytics[]>([])
  const [filteredConversations, setFilteredConversations] = useState<ConversationAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [engagementFilter, setEngagementFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    filterConversations()
  }, [conversations, searchQuery, stageFilter, engagementFilter, dateFilter])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/crm/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      
      const data = await response.json()
      
      // Transform the API data to match our component interface
      const transformedConversations = (data.conversations || []).map((conv: any) => {
        const contact = conv.contact_interactions?.[0]?.lead_contacts
        const analytics = conv.conversation_analytics
        
        return {
          id: conv.id,
          session_id: conv.session_identifier || conv.id,
          contact_id: contact?.id || null,
          contact_name: contact?.name || 'Unknown Contact',
          contact_email: contact?.email || '',
          organization: contact?.company || contact?.organization || 'Unknown Organization',
          total_messages: analytics?.total_messages || 0,
          conversation_duration_minutes: analytics?.conversation_duration_minutes || 0,
          user_engagement_score: analytics?.user_engagement_score || 0,
          intent_distribution: {},
          topics_covered: analytics?.topics_covered || [],
          pain_points_mentioned: analytics?.pain_points_mentioned || [],
          buying_signals: analytics?.buying_signals || 0,
          objections_raised: analytics?.objections_raised || [],
          competitive_mentions: analytics?.competitive_mentions || [],
          demo_requested: analytics?.demo_requested || false,
          contact_info_provided: analytics?.contact_info_provided || false,
          meeting_requested: analytics?.meeting_requested || false,
          pricing_discussed: analytics?.pricing_discussed || false,
          partnership_assessment_completed: analytics?.partnership_assessment_completed || false,
          technical_questions: analytics?.technical_questions || 0,
          business_questions: analytics?.business_questions || 0,
          satisfaction_indicators: analytics?.satisfaction_indicators || {},
          conversion_stage: analytics?.conversion_stage || 'awareness',
          last_updated: conv.last_interaction_at || conv.updated_at,
          created_at: conv.created_at
        } as ConversationAnalytics
      })
      
      setConversations(transformedConversations)
      setFilteredConversations(transformedConversations)
    } catch (error) {
      console.error('Failed to load conversations:', error)
      // Fallback to mock data on error
      const mockConversations: ConversationAnalytics[] = [
        {
          id: '1',
          session_id: 'sess_123',
          contact_id: 'contact-1',
          contact_name: 'Dr. Sarah Johnson',
          contact_email: 'sarah.johnson@springfield.edu',
          organization: 'Springfield University',
          total_messages: 25,
          conversation_duration_minutes: 45,
          user_engagement_score: 0.85,
          intent_distribution: {
            'information_seeking': 40,
            'demo_request': 30,
            'pricing_inquiry': 20,
            'partnership_interest': 10
          },
          topics_covered: ['multi-campus management', 'student engagement', 'integration capabilities', 'partnership opportunities'],
          pain_points_mentioned: ['current system limitations', 'cross-campus coordination', 'student retention'],
          buying_signals: 8,
          objections_raised: ['budget concerns', 'timeline constraints'],
          competitive_mentions: ['Canvas LMS', 'Blackboard'],
          demo_requested: true,
          contact_info_provided: true,
          meeting_requested: true,
          pricing_discussed: true,
          partnership_assessment_completed: true,
          technical_questions: 6,
          business_questions: 4,
          satisfaction_indicators: {
            positive_sentiment: 0.8,
            question_resolution: 0.9,
            follow_up_interest: 0.95
          },
          conversion_stage: 'evaluation',
          last_updated: '2025-01-27T11:15:00Z',
          created_at: '2025-01-27T10:30:00Z'
        },
        {
          id: '2',
          session_id: 'sess_124',
          contact_id: 'contact-2',
          contact_name: 'Prof. Michael Chen',
          contact_email: 'm.chen@metro-cc.edu',
          organization: 'Metro Community College',
          total_messages: 18,
          conversation_duration_minutes: 28,
          user_engagement_score: 0.72,
          intent_distribution: {
            'information_seeking': 60,
            'technical_inquiry': 25,
            'demo_request': 15
          },
          topics_covered: ['technical integration', 'API capabilities', 'data migration', 'training requirements'],
          pain_points_mentioned: ['legacy system integration', 'staff training needs'],
          buying_signals: 4,
          objections_raised: ['technical complexity'],
          competitive_mentions: ['Moodle'],
          demo_requested: false,
          contact_info_provided: true,
          meeting_requested: false,
          pricing_discussed: false,
          partnership_assessment_completed: false,
          technical_questions: 12,
          business_questions: 2,
          satisfaction_indicators: {
            positive_sentiment: 0.7,
            question_resolution: 0.85,
            follow_up_interest: 0.6
          },
          conversion_stage: 'interest',
          last_updated: '2025-01-27T09:45:00Z',
          created_at: '2025-01-27T09:15:00Z'
        },
        {
          id: '3',
          session_id: 'sess_125',
          contact_id: 'contact-3',
          contact_name: 'Dr. Emily Rodriguez',
          contact_email: 'e.rodriguez@techins.edu',
          organization: 'Tech Institute',
          total_messages: 32,
          conversation_duration_minutes: 52,
          user_engagement_score: 0.92,
          intent_distribution: {
            'partnership_interest': 50,
            'co_development': 30,
            'demo_request': 20
          },
          topics_covered: ['co-development opportunities', 'strategic partnership', 'custom development', 'revenue sharing'],
          pain_points_mentioned: ['lack of customization options', 'vendor lock-in concerns'],
          buying_signals: 12,
          objections_raised: [],
          competitive_mentions: [],
          demo_requested: true,
          contact_info_provided: true,
          meeting_requested: true,
          pricing_discussed: true,
          partnership_assessment_completed: true,
          technical_questions: 8,
          business_questions: 10,
          satisfaction_indicators: {
            positive_sentiment: 0.95,
            question_resolution: 0.98,
            follow_up_interest: 1.0
          },
          conversion_stage: 'partnership',
          last_updated: '2025-01-27T08:45:00Z',
          created_at: '2025-01-27T08:00:00Z'
        }
      ]
      
      setConversations(mockConversations)
      setFilteredConversations(mockConversations)
    } finally {
      setLoading(false)
    }
  }

  const filterConversations = () => {
    let filtered = conversations

    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.topics_covered.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(conv => conv.conversion_stage === stageFilter)
    }

    if (engagementFilter !== 'all') {
      filtered = filtered.filter(conv => {
        switch (engagementFilter) {
          case 'high': return conv.user_engagement_score >= 0.8
          case 'medium': return conv.user_engagement_score >= 0.5 && conv.user_engagement_score < 0.8
          case 'low': return conv.user_engagement_score < 0.5
          default: return true
        }
      })
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(conv => {
        const created = new Date(conv.created_at)
        switch (dateFilter) {
          case 'today':
            return created.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return created >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return created >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredConversations(filtered)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'awareness': return 'bg-gray-100 text-gray-800'
      case 'interest': return 'bg-blue-100 text-blue-800'
      case 'consideration': return 'bg-yellow-100 text-yellow-800'
      case 'evaluation': return 'bg-orange-100 text-orange-800'
      case 'decision': return 'bg-purple-100 text-purple-800'
      case 'partnership': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getSentimentIcon = (score: number) => {
    if (score >= 0.7) return <ThumbsUp className="w-4 h-4 text-green-500" />
    if (score >= 0.4) return <Minus className="w-4 h-4 text-yellow-500" />
    return <ThumbsDown className="w-4 h-4 text-red-500" />
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getConversationStats = () => {
    const totalConversations = conversations.length
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.total_messages, 0)
    const avgEngagement = conversations.reduce((sum, conv) => sum + conv.user_engagement_score, 0) / totalConversations || 0
    const totalBuyingSignals = conversations.reduce((sum, conv) => sum + conv.buying_signals, 0)
    
    return { totalConversations, totalMessages, avgEngagement, totalBuyingSignals }
  }

  const stats = getConversationStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1F504B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation analytics...</p>
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
            <h1 className="text-3xl font-bold text-[#1F504B]">AIVY Conversation Analytics</h1>
            <p className="text-[#1F504B]/70 mt-1">
              {filteredConversations.length} of {conversations.length} conversations
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-[#1F504B]">{stats.totalConversations}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-[#5A8A84]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalMessages}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-green-600">{(stats.avgEngagement * 100).toFixed(0)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Buying Signals</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalBuyingSignals}</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
            >
              <option value="all">All Stages</option>
              <option value="awareness">Awareness</option>
              <option value="interest">Interest</option>
              <option value="consideration">Consideration</option>
              <option value="evaluation">Evaluation</option>
              <option value="decision">Decision</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>

          <div>
            <select
              value={engagementFilter}
              onChange={(e) => setEngagementFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
            >
              <option value="all">All Engagement</option>
              <option value="high">High (80%+)</option>
              <option value="medium">Medium (50-80%)</option>
              <option value="low">Low (&lt;50%)</option>
            </select>
          </div>

          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-6">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {conversation.contact_name?.split(' ').map(n => n[0]).join('') || 'AI'}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    {conversation.contact_name ? (
                      <Link
                        href={`/admin/crm/contacts/${conversation.contact_id}`}
                        className="text-lg font-semibold text-[#1F504B] hover:text-[#5A8A84]"
                      >
                        {conversation.contact_name}
                      </Link>
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900">Anonymous User</h3>
                    )}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(conversation.conversion_stage)}`}>
                      {conversation.conversion_stage}
                    </span>
                  </div>
                  {conversation.organization && (
                    <div className="flex items-center text-gray-500 mt-1">
                      <Building className="w-4 h-4 mr-1" />
                      <span>{conversation.organization}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/crm/conversations/${conversation.id}`}
                  className="text-gray-400 hover:text-[#5A8A84]"
                >
                  <Eye className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#1F504B]">{conversation.total_messages}</div>
                <div className="text-xs text-gray-500">Messages</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{formatDuration(conversation.conversation_duration_minutes)}</div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold px-2 py-1 rounded ${getEngagementColor(conversation.user_engagement_score)}`}>
                  {(conversation.user_engagement_score * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">Engagement</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{conversation.buying_signals}</div>
                <div className="text-xs text-gray-500">Buy Signals</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{conversation.technical_questions}</div>
                <div className="text-xs text-gray-500">Tech Q's</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  {getSentimentIcon(conversation.satisfaction_indicators.positive_sentiment)}
                  <span className="text-sm font-semibold">
                    {(conversation.satisfaction_indicators.positive_sentiment * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">Sentiment</div>
              </div>
            </div>

            {/* Action Indicators */}
            <div className="flex flex-wrap gap-2 mb-4">
              {conversation.demo_requested && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  <Target className="w-3 h-3 mr-1" />
                  Demo Requested
                </span>
              )}
              {conversation.meeting_requested && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  <Calendar className="w-3 h-3 mr-1" />
                  Meeting Requested
                </span>
              )}
              {conversation.pricing_discussed && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Pricing Discussed
                </span>
              )}
              {conversation.partnership_assessment_completed && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  <Users className="w-3 h-3 mr-1" />
                  Assessment Completed
                </span>
              )}
            </div>

            {/* Topics and Pain Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Topics Covered</h4>
                <div className="flex flex-wrap gap-1">
                  {conversation.topics_covered.map((topic, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              {conversation.pain_points_mentioned.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Pain Points</h4>
                  <div className="flex flex-wrap gap-1">
                    {conversation.pain_points_mentioned.map((point, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Started: {formatDateTime(conversation.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>Session: {conversation.session_id}</span>
                </div>
              </div>
              
              {conversation.contact_id && (
                <Link
                  href={`/admin/crm/contacts/${conversation.contact_id}`}
                  className="flex items-center text-[#5A8A84] hover:text-[#1F504B]"
                >
                  <span>View Contact</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
          </div>
        ))}

        {filteredConversations.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
            <p className="text-gray-600">
              {conversations.length === 0 
                ? "No AIVY conversations have been recorded yet."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}