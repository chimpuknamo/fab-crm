'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit,
  Trash2,
  MessageSquare,
  Target,
  Plus,
  Download,
  Mail,
  Phone,
  Building,
  Star,
  StarOff,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  organization: string
  role?: string
  leadScore: number
  status: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'converted' | 'lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  lastActivity: string
  source: 'aivy_chat' | 'assessment' | 'manual' | 'referral'
  tags: string[]
  conversationCount: number
  hasAssessment: boolean
  starred: boolean
  createdAt: string
}

export default function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchQuery, statusFilter, sourceFilter])

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/crm/contacts')
      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }
      
      const data = await response.json()
      setContacts(data.contacts || [])
      setFilteredContacts(data.contacts || [])
    } catch (error) {
      console.error('Failed to load contacts:', error)
      // Fallback to mock data on error
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@springfield.edu',
          phone: '+1-555-0123',
          organization: 'Springfield University',
          role: 'Dean of Education',
          leadScore: 85,
          status: 'opportunity',
          priority: 'high',
          lastActivity: '2025-01-27T10:30:00Z',
          source: 'assessment',
          tags: ['university', 'strategic-partner', 'education-tech'],
          conversationCount: 3,
          hasAssessment: true,
          starred: true,
          createdAt: '2025-01-25T14:20:00Z'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'm.chen@metro-cc.edu',
          phone: '+1-555-0124',
          organization: 'Metro Community College',
          role: 'IT Director',
          leadScore: 62,
          status: 'qualified',
          priority: 'medium',
          lastActivity: '2025-01-27T09:15:00Z',
          source: 'aivy_chat',
          tags: ['community-college', 'it-decision-maker'],
          conversationCount: 2,
          hasAssessment: false,
          starred: false,
          createdAt: '2025-01-26T11:45:00Z'
        },
        {
          id: '3',
          name: 'Prof. Emily Rodriguez',
          email: 'e.rodriguez@techins.edu',
          phone: '+1-555-0125',
          organization: 'Tech Institute',
          role: 'Professor of Computer Science',
          leadScore: 78,
          status: 'contacted',
          priority: 'urgent',
          lastActivity: '2025-01-27T08:00:00Z',
          source: 'referral',
          tags: ['technical-education', 'computer-science', 'follow-up-due'],
          conversationCount: 1,
          hasAssessment: true,
          starred: true,
          createdAt: '2025-01-24T16:30:00Z'
        },
        {
          id: '4',
          name: 'James Wilson',
          email: 'jwilson@riverside.k12.ca.us',
          organization: 'Riverside School District',
          role: 'Curriculum Coordinator',
          leadScore: 45,
          status: 'new',
          priority: 'low',
          lastActivity: '2025-01-26T15:45:00Z',
          source: 'aivy_chat',
          tags: ['k12', 'curriculum'],
          conversationCount: 1,
          hasAssessment: false,
          starred: false,
          createdAt: '2025-01-26T15:45:00Z'
        }
      ]
      
      setContacts(mockContacts)
      setFilteredContacts(mockContacts)
    } finally {
      setLoading(false)
    }
  }

  const filterContacts = () => {
    let filtered = contacts

    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.organization.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter)
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(contact => contact.source === sourceFilter)
    }

    setFilteredContacts(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'qualified': return 'bg-purple-100 text-purple-800'
      case 'opportunity': return 'bg-yellow-100 text-yellow-800'
      case 'converted': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high': return <CheckCircle className="w-4 h-4 text-orange-500" />
      case 'medium': return <Clock className="w-4 h-4 text-blue-500" />
      default: return null
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'aivy_chat': return <MessageSquare className="w-4 h-4 text-blue-600" />
      case 'assessment': return <Target className="w-4 h-4 text-purple-600" />
      case 'manual': return <Edit className="w-4 h-4 text-gray-600" />
      case 'referral': return <Star className="w-4 h-4 text-yellow-600" />
      default: return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatLastActivity = (dateString: string) => {
    const now = new Date()
    const activity = new Date(dateString)
    const diffMs = now.getTime() - activity.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    }
  }

  const toggleStarred = (contactId: string) => {
    setContacts(contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, starred: !contact.starred }
        : contact
    ))
  }

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1F504B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
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
            <h1 className="text-3xl font-bold text-[#1F504B]">Contacts</h1>
            <p className="text-[#1F504B]/70 mt-1">
              {filteredContacts.length} of {contacts.length} contacts
            </p>
          </div>
          <div className="flex space-x-3">
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

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
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
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="opportunity">Opportunity</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="aivy_chat">AIVY Chat</option>
              <option value="assessment">Assessment</option>
              <option value="manual">Manual</option>
              <option value="referral">Referral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts(filteredContacts.map(c => c.id))
                      } else {
                        setSelectedContacts([])
                      }
                    }}
                    className="rounded border-gray-300 text-[#1F504B] focus:ring-[#1F504B]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                      className="rounded border-gray-300 text-[#1F504B] focus:ring-[#1F504B]"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/crm/contacts/${contact.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-[#1F504B]"
                          >
                            {contact.name}
                          </Link>
                          {contact.starred && (
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          )}
                          {getPriorityIcon(contact.priority)}
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          {contact.email && (
                            <div className="flex items-center text-gray-500">
                              <Mail className="w-3 h-3 mr-1" />
                              <span className="text-xs">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center text-gray-500">
                              <Phone className="w-3 h-3 mr-1" />
                              <span className="text-xs">{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contact.organization}</div>
                        {contact.role && (
                          <div className="text-xs text-gray-500">{contact.role}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-gradient-to-r from-[#1F504B] to-[#5A8A84] h-2 rounded-full"
                          style={{ width: `${contact.leadScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{contact.leadScore}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(contact.source)}
                      <span className="text-sm text-gray-900 capitalize">{contact.source.replace('_', ' ')}</span>
                      {contact.hasAssessment && (
                        <Target className="w-4 h-4 text-purple-500" />
                      )}
                      {contact.conversationCount > 0 && (
                        <div className="flex items-center text-blue-500">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span className="text-xs">{contact.conversationCount}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastActivity(contact.lastActivity)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleStarred(contact.id)}
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        {contact.starred ? (
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                      
                      <Link
                        href={`/admin/crm/contacts/${contact.id}`}
                        className="text-[#5A8A84] hover:text-[#1F504B]"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      
                      <button className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters, or add a new contact.
            </p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg border border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedContacts.length} contacts selected
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-[#1F504B] text-white rounded text-sm hover:bg-[#5A8A84] transition-colors">
                Update Status
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                Add Tags
              </button>
              <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}