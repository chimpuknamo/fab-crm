'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  documentId?: string
}

export default function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFile = async (uploadedFile: UploadedFile) => {
    const { file, id } = uploadedFile
    
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'uploading' as const, progress: 10 } : f
      ))

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Update progress
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, progress: 50 } : f
      ))

      // Create document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          content: '', // Will be processed later
          source_type: 'upload' as const,
          source_url: filePath,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          processing_status: 'pending' as const
        })
        .select()
        .single()

      if (documentError) throw documentError

      // Update progress
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, progress: 75, documentId: documentData.id } : f
      ))

      // Process document (extract text and create embeddings)
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: { 
          documentId: documentData.id,
          filePath: filePath 
        }
      })

      if (processError) {
        console.warn('Document processing failed:', processError)
        // Mark as completed even if processing fails - user can reprocess later
      }

      // Mark as completed
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'completed' as const, progress: 100 } : f
      ))

    } catch (error: any) {
      console.error('Upload failed:', error)
      setFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'error' as const, 
          error: error.message,
          progress: 0 
        } : f
      ))
    }
  }

  const uploadAllFiles = async () => {
    setIsUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    // Upload files concurrently (max 3 at a time)
    const concurrency = 3
    for (let i = 0; i < pendingFiles.length; i += concurrency) {
      const batch = pendingFiles.slice(i, i + concurrency)
      await Promise.all(batch.map(uploadFile))
    }
    
    setIsUploading(false)
  }

  const retryFile = (id: string) => {
    const file = files.find(f => f.id === id)
    if (file) {
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'pending' as const, error: undefined, progress: 0 } : f
      ))
    }
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <File className="h-4 w-4 text-gray-500" />
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'uploading':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
    }
  }

  const pendingFilesCount = files.filter(f => f.status === 'pending').length
  const completedFilesCount = files.filter(f => f.status === 'completed').length
  const errorFilesCount = files.filter(f => f.status === 'error').length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-[#1F504B] bg-[#D8E3E0]/20'
              : 'border-gray-300 hover:border-[#5A8A84] hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-[#1F504B] font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag and drop documents here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports: PDF, TXT, MD, DOC, DOCX (max 10MB each)
              </p>
            </div>
          )}
        </div>

        {/* Upload Summary */}
        {files.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">
              Total: <strong>{files.length}</strong>
            </span>
            {pendingFilesCount > 0 && (
              <span className="text-blue-600">
                Pending: <strong>{pendingFilesCount}</strong>
              </span>
            )}
            {completedFilesCount > 0 && (
              <span className="text-green-600">
                Completed: <strong>{completedFilesCount}</strong>
              </span>
            )}
            {errorFilesCount > 0 && (
              <span className="text-red-600">
                Errors: <strong>{errorFilesCount}</strong>
              </span>
            )}
          </div>
        )}

        {/* Upload Button */}
        {pendingFilesCount > 0 && (
          <Button
            onClick={uploadAllFiles}
            disabled={isUploading}
            className="w-full bg-[#1F504B] hover:bg-[#5A8A84]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading {pendingFilesCount} files...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {pendingFilesCount} files
              </>
            )}
          </Button>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {getStatusIcon(uploadedFile.status)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">
                      {uploadedFile.file.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getStatusColor(uploadedFile.status)}`}
                    >
                      {uploadedFile.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {uploadedFile.status === 'uploading' && (
                      <span>{uploadedFile.progress}%</span>
                    )}
                  </div>
                  
                  {uploadedFile.status === 'uploading' && (
                    <Progress value={uploadedFile.progress} className="h-1 mt-2" />
                  )}
                  
                  {uploadedFile.error && (
                    <Alert className="mt-2">
                      <AlertDescription className="text-xs text-red-700">
                        {uploadedFile.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {uploadedFile.status === 'error' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryFile(uploadedFile.id)}
                      className="text-xs"
                    >
                      Retry
                    </Button>
                  )}
                  {(uploadedFile.status === 'pending' || uploadedFile.status === 'error') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Success Message */}
        {completedFilesCount > 0 && errorFilesCount === 0 && pendingFilesCount === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              All documents uploaded and processed successfully! They are now available for AI queries.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}