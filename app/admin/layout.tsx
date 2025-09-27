'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database, Settings, BarChart3, Home, Brain, Users, Target, MessageSquare, CheckCircle } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Documents',
      href: '/admin/documents',
      icon: Database,
      current: pathname === '/admin/documents'
    },
    {
      name: 'Knowledge Base',
      href: '/admin/knowledge-base',
      icon: Brain,
      current: pathname === '/admin/knowledge-base'
    },
    {
      name: 'CRM Dashboard',
      href: '/admin/crm',
      icon: Users,
      current: pathname?.startsWith('/admin/crm') || false
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname === '/admin/analytics'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: pathname === '/admin/settings'
    }
  ]

  // CRM sub-navigation when on CRM pages
  const crmNavigation = [
    {
      name: 'Dashboard',
      href: '/admin/crm',
      icon: BarChart3,
      current: pathname === '/admin/crm'
    },
    {
      name: 'Contacts',
      href: '/admin/crm/contacts',
      icon: Users,
      current: pathname?.startsWith('/admin/crm/contacts') || false
    },
    {
      name: 'Assessments',
      href: '/admin/crm/assessments',
      icon: Target,
      current: pathname?.startsWith('/admin/crm/assessments') || false
    },
    {
      name: 'Conversations',
      href: '/admin/crm/conversations',
      icon: MessageSquare,
      current: pathname?.startsWith('/admin/crm/conversations') || false
    },
    {
      name: 'Tasks',
      href: '/admin/crm/tasks',
      icon: CheckCircle,
      current: pathname?.startsWith('/admin/crm/tasks') || false
    },
    {
      name: 'Analytics',
      href: '/admin/crm/analytics',
      icon: BarChart3,
      current: pathname === '/admin/crm/analytics'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-[#1F504B] hover:text-[#5A8A84] transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-semibold">Back to FabriiQ</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-[#1F504B]" />
                  <span className="text-xl font-bold text-gray-900">FabriiQ Admin</span>
                  <span className="text-xs bg-[#D8E3E0] text-[#1F504B] px-2 py-1 rounded-full">Alpha</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                AI Knowledge Management
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8 px-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        item.current
                          ? 'bg-[#1F504B] text-white'
                          : 'text-gray-700 hover:bg-[#D8E3E0] hover:text-[#1F504B]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            
            {/* CRM Sub-navigation */}
            {pathname?.startsWith('/admin/crm') && (
              <div className="mt-6">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  CRM Tools
                </h3>
                <ul className="space-y-1">
                  {crmNavigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            item.current
                              ? 'bg-[#5A8A84] text-white'
                              : 'text-gray-600 hover:bg-[#D8E3E0] hover:text-[#1F504B]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {pathname?.startsWith('/admin/crm') ? 'CRM Stats' : 'Quick Stats'}
              </h3>
              <div className="space-y-2">
                {pathname?.startsWith('/admin/crm') ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Leads</span>
                      <span className="font-medium text-[#1F504B]">-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Tasks</span>
                      <span className="font-medium text-[#1F504B]">-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conversations</span>
                      <span className="font-medium text-[#1F504B]">-</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Documents</span>
                      <span className="font-medium text-gray-900">-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vector Chunks</span>
                      <span className="font-medium text-gray-900">-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Tokens</span>
                      <span className="font-medium text-gray-900">-</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">System Online</span>
              </div>
              <p className="text-xs text-green-600 mt-1">AI services are running</p>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}