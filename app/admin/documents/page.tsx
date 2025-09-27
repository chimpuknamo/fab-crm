'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Trash2, Eye, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle, FolderOpen, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Document {
  id: string
  title: string
  content: string
  source_type: 'upload' | 'web' | 'manual'
  file_size?: number
  file_type?: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [availableFiles, setAvailableFiles] = useState<any[]>([])
  const [bulkUploadResults, setBulkUploadResults] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      setError('Please select a file and enter a title')
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Read file content
      const content = await readFileContent(uploadFile)

      // Create document record
      const { data: newDoc, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: uploadTitle.trim(),
          content,
          source_type: 'upload',
          file_size: uploadFile.size,
          file_type: uploadFile.type || 'text/plain',
          processing_status: 'pending'
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Trigger document processing
      await processDocument(newDoc.id, content)

      // Refresh documents list
      await loadDocuments()

      // Reset form
      setShowUploadModal(false)
      setUploadFile(null)
      setUploadTitle('')

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const processDocument = async (documentId: string, content: string) => {
    try {
      const response = await fetch('/api/admin/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, content })
      })

      if (!response.ok) {
        throw new Error('Document processing failed')
      }

      console.log('Document processing initiated successfully')
    } catch (error) {
      console.error('Processing error:', error)
    }
  }

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      setDocuments(docs => docs.filter(doc => doc.id !== documentId))
    } catch (error) {
      console.error('Delete error:', error)
      setError('Failed to delete document')
    }
  }

  const reprocessDocument = async (document: Document) => {
    try {
      await supabase
        .from('documents')
        .update({ processing_status: 'pending' })
        .eq('id', document.id)

      await processDocument(document.id, document.content)
      await loadDocuments()
    } catch (error) {
      console.error('Reprocess error:', error)
      setError('Failed to reprocess document')
    }
  }

  const loadAvailableFiles = async () => {
    try {
      const response = await fetch('/api/admin/bulk-upload?sourcePath=FabriiQ-docs')
      const data = await response.json()

      if (data.success) {
        setAvailableFiles(data.files)
      } else {
        setError(data.error || 'Failed to load available files')
      }
    } catch (error) {
      console.error('Error loading available files:', error)
      setError('Failed to load available files')
    }
  }

  const handleBulkUpload = async () => {
    try {
      setBulkUploading(true)
      setError(null)
      setBulkUploadResults([])

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePath: 'FabriiQ-docs'
        })
      })

      const result = await response.json()

      if (result.success) {
        setBulkUploadResults(result.results)
        await loadDocuments() // Refresh the documents list
      } else {
        setError(result.error || 'Bulk upload failed')
      }
    } catch (error) {
      console.error('Bulk upload error:', error)
      setError('Bulk upload failed')
    } finally {
      setBulkUploading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600 mt-2">Manage your FabriiQ AI knowledge base documents</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-[#1F504B] text-white px-6 py-3 rounded-lg hover:bg-[#5A8A84] flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
              </button>
              <button
                onClick={() => {
                  setShowBulkUploadModal(true)
                  loadAvailableFiles()
                }}
                className="bg-[#F59E0B] text-white px-6 py-3 rounded-lg hover:bg-orange-600 flex items-center space-x-2 transition-colors"
              >
                <FolderOpen className="w-5 h-5" />
                <span>Bulk Upload FabriiQ Docs</span>
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Documents', value: documents.length, color: 'bg-[#1F504B]' },
              { label: 'Completed', value: documents.filter(d => d.processing_status === 'completed').length, color: 'bg-green-500' },
              { label: 'Processing', value: documents.filter(d => d.processing_status === 'processing').length, color: 'bg-blue-500' },
              { label: 'Failed', value: documents.filter(d => d.processing_status === 'failed').length, color: 'bg-red-500' }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4`}>
                    {stat.value}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            <button
              onClick={loadDocuments}
              className="text-[#1F504B] hover:text-[#5A8A84] flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 text-[#1F504B] hover:text-[#5A8A84] font-medium"
              >
                Upload your first document
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{document.title}</div>
                            <div className="text-sm text-gray-500">ID: {document.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {document.source_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(document.processing_status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.processing_status)}`}>
                            {document.processing_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.file_size ? `${Math.round(document.file_size / 1024)} KB` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(document.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedDocument(document)}
                            className="text-[#1F504B] hover:text-[#5A8A84]"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {document.processing_status === 'failed' && (
                            <button
                              onClick={() => reprocessDocument(document)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteDocument(document.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1F504B]"
                      placeholder="Enter document title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      accept=".txt,.md,.doc,.docx"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1F504B]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: TXT, MD, DOC, DOCX
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading || !uploadFile || !uploadTitle.trim()}
                    className="bg-[#1F504B] text-white px-4 py-2 rounded-lg hover:bg-[#5A8A84] disabled:opacity-50 flex items-center space-x-2"
                  >
                    {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Status: {selectedDocument.processing_status} • 
                      Created: {new Date(selectedDocument.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded-lg">
                  {selectedDocument.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bulk Upload FabriiQ Documents</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload all markdown files from the FabriiQ-docs directory
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBulkUploadModal(false)
                      setBulkUploadResults([])
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Available Files Preview */}
                {availableFiles.length > 0 && bulkUploadResults.length === 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Available Files ({availableFiles.length})
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {availableFiles.map((file, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.title}</div>
                            <div className="text-xs text-gray-500">{file.fileName}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round(file.size / 1024)}KB
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Results */}
                {bulkUploadResults.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Upload Results ({bulkUploadResults.length})
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {bulkUploadResults.map((result, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{result.title}</div>
                            <div className="text-xs text-gray-500">{result.fileName}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {result.status === 'success' && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Success
                              </span>
                            )}
                            {result.status === 'error' && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Error
                              </span>
                            )}
                            {result.status === 'skipped' && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Skipped
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowBulkUploadModal(false)
                      setBulkUploadResults([])
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    {bulkUploadResults.length > 0 ? 'Close' : 'Cancel'}
                  </button>
                  {bulkUploadResults.length === 0 && (
                    <button
                      onClick={handleBulkUpload}
                      disabled={bulkUploading || availableFiles.length === 0}
                      className="bg-[#F59E0B] text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {bulkUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                      <span>{bulkUploading ? 'Uploading...' : `Upload ${availableFiles.length} Files`}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}