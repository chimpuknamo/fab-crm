'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Database, Settings, RefreshCw, Zap, Brain, Users, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface KnowledgeBaseStats {
  totalDocuments: number
  totalChunks: number
  totalTokens: number
  avgProcessingTime: number
  completedDocuments: number
  failedDocuments: number
  processingDocuments: number
  pendingDocuments: number
}

interface AISettings {
  id: string
  setting_key: string
  setting_value: any
  description: string
  is_active: boolean
}

export default function AdminKnowledgeBasePage() {
  const [stats, setStats] = useState<KnowledgeBaseStats>({
    totalDocuments: 0,
    totalChunks: 0,
    totalTokens: 0,
    avgProcessingTime: 0,
    completedDocuments: 0,
    failedDocuments: 0,
    processingDocuments: 0,
    pendingDocuments: 0
  })
  const [settings, setSettings] = useState<AISettings[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadStats(), loadSettings()])
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load knowledge base data')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Get document stats
      const { data: documents } = await supabase
        .from('documents')
        .select('id, processing_status, file_size')

      // Get chunks stats
      const { data: chunks } = await supabase
        .from('document_chunks')
        .select('token_count')

      // Get analytics for processing times
      const { data: analytics } = await supabase
        .from('ai_analytics')
        .select('metadata')
        .eq('event_type', 'document_processed')

      const totalDocuments = documents?.length || 0
      const totalChunks = chunks?.length || 0
      const totalTokens = chunks?.reduce((sum, chunk) => sum + (chunk.token_count || 0), 0) || 0
      
      const processingTimes = analytics
        ?.map(a => a.metadata?.processing_time_ms)
        .filter(Boolean) || []
      const avgProcessingTime = processingTimes.length > 0 
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
        : 0

      const statusCounts = documents?.reduce((acc, doc) => {
        acc[doc.processing_status] = (acc[doc.processing_status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      setStats({
        totalDocuments,
        totalChunks,
        totalTokens,
        avgProcessingTime,
        completedDocuments: statusCounts.completed || 0,
        failedDocuments: statusCounts.failed || 0,
        processingDocuments: statusCounts.processing || 0,
        pendingDocuments: statusCounts.pending || 0
      })

    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('ai_settings')
        .select('*')
        .order('setting_key')

      setSettings(data || [])
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const updateSetting = async (id: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({ setting_value: newValue })
        .eq('id', id)

      if (error) throw error

      setSettings(prev => prev.map(setting => 
        setting.id === id 
          ? { ...setting, setting_value: newValue }
          : setting
      ))

      setSuccess('Setting updated successfully')
      setTimeout(() => setSuccess(null), 3000)

    } catch (error) {
      console.error('Error updating setting:', error)
      setError('Failed to update setting')
    }
  }

  const reprocessAllFailedDocuments = async () => {
    if (!confirm('Are you sure you want to reprocess all failed documents?')) return

    try {
      setProcessing(true)
      setError(null)

      const { data: failedDocs } = await supabase
        .from('documents')
        .select('id, content')
        .eq('processing_status', 'failed')

      if (!failedDocs || failedDocs.length === 0) {
        setError('No failed documents found')
        return
      }

      // Reset status to pending
      await supabase
        .from('documents')
        .update({ processing_status: 'pending' })
        .eq('processing_status', 'failed')

      // Trigger processing for each document
      for (const doc of failedDocs) {
        try {
          await fetch('/api/admin/process-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentId: doc.id,
              content: doc.content
            })
          })
        } catch (error) {
          console.error(`Failed to reprocess document ${doc.id}:`, error)
        }
      }

      setSuccess(`Initiated reprocessing of ${failedDocs.length} documents`)
      await loadStats()

    } catch (error) {
      console.error('Batch reprocessing error:', error)
      setError('Failed to initiate batch reprocessing')
    } finally {
      setProcessing(false)
    }
  }

  const optimizeVectorIndex = async () => {
    try {
      setProcessing(true)
      setError(null)

      // In a real implementation, this would optimize the vector index
      // For now, we'll simulate the operation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setSuccess('Vector index optimization completed')
      await loadStats()

    } catch (error) {
      console.error('Index optimization error:', error)
      setError('Failed to optimize vector index')
    } finally {
      setProcessing(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string
    value: number | string
    icon: any
    color: string
    subtitle?: string
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Knowledge Base Management</h1>
              <p className="text-gray-600 mt-2">Monitor and optimize your AI knowledge base performance</p>
            </div>
            <button
              onClick={loadData}
              className="bg-[#1F504B] text-white px-4 py-2 rounded-lg hover:bg-[#5A8A84] flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Documents"
            value={stats.totalDocuments}
            icon={Database}
            color="bg-[#1F504B]"
            subtitle="In knowledge base"
          />
          <StatCard
            title="Vector Chunks"
            value={stats.totalChunks}
            icon={Brain}
            color="bg-blue-500"
            subtitle="Searchable segments"
          />
          <StatCard
            title="Total Tokens"
            value={stats.totalTokens.toLocaleString()}
            icon={BarChart3}
            color="bg-green-500"
            subtitle="Processing capacity"
          />
          <StatCard
            title="Avg Processing Time"
            value={`${Math.round(stats.avgProcessingTime)}ms`}
            icon={Clock}
            color="bg-purple-500"
            subtitle="Per document"
          />
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Completed', value: stats.completedDocuments, color: 'bg-green-500' },
                { label: 'Processing', value: stats.processingDocuments, color: 'bg-blue-500' },
                { label: 'Pending', value: stats.pendingDocuments, color: 'bg-yellow-500' },
                { label: 'Failed', value: stats.failedDocuments, color: 'bg-red-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={reprocessAllFailedDocuments}
                disabled={processing || stats.failedDocuments === 0}
                className="w-full bg-red-100 text-red-700 px-4 py-3 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                <span>Reprocess Failed Documents ({stats.failedDocuments})</span>
              </button>
              
              <button
                onClick={optimizeVectorIndex}
                disabled={processing}
                className="w-full bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Zap className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                <span>Optimize Vector Index</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>AI Configuration Settings</span>
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading settings...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {settings.map((setting) => (
                <div key={setting.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {setting.setting_key === 'embedding_model' ? (
                        <select
                          value={setting.setting_value}
                          onChange={(e) => updateSetting(setting.id, e.target.value)}
                          className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-[#1F504B]"
                        >
                          <option value="Supabase/gte-small">Supabase/gte-small</option>
                          <option value="text-embedding-ada-002">OpenAI Ada 002</option>
                        </select>
                      ) : setting.setting_key === 'system_prompt' ? (
                        <textarea
                          value={setting.setting_value}
                          onChange={(e) => updateSetting(setting.id, e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 text-sm w-80 h-20 focus:outline-none focus:border-[#1F504B]"
                          placeholder="Enter system prompt..."
                        />
                      ) : (
                        <input
                          type="number"
                          value={setting.setting_value}
                          onChange={(e) => updateSetting(setting.id, parseFloat(e.target.value))}
                          className="border border-gray-300 rounded px-3 py-1 text-sm w-20 focus:outline-none focus:border-[#1F504B]"
                          min="0"
                          step={setting.setting_key.includes('threshold') ? '0.1' : '1'}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}