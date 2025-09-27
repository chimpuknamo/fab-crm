import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourcePath, filePattern = '*.md' } = body

    if (!sourcePath) {
      return NextResponse.json(
        { error: 'sourcePath is required' },
        { status: 400 }
      )
    }

    console.log(`Starting bulk upload from ${sourcePath}...`)

    // Initialize Supabase client
    const supabase = createServiceClient()

    // Get absolute path
    const fullPath = path.resolve(process.cwd(), sourcePath)
    
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: `Source path does not exist: ${fullPath}` },
        { status: 400 }
      )
    }

    // Read directory contents
    const files = fs.readdirSync(fullPath)
    const markdownFiles = files.filter(file => 
      file.endsWith('.md') && !file.startsWith('.') && file !== 'README.md'
    )

    console.log(`Found ${markdownFiles.length} markdown files to upload`)

    const uploadResults = []
    let successCount = 0
    let errorCount = 0

    // Process each file
    for (const fileName of markdownFiles) {
      try {
        const filePath = path.join(fullPath, fileName)
        const content = fs.readFileSync(filePath, 'utf-8')
        
        // Clean up the filename for the title
        const title = fileName
          .replace(/\.md$/, '')
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .replace(/^\d+_/, '') // Remove number prefixes like "01_"
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        // Check if document already exists
        const { data: existing } = await supabase
          .from('documents')
          .select('id')
          .eq('title', title)
          .single()

        if (existing) {
          console.log(`Skipping ${fileName} - document already exists`)
          uploadResults.push({
            fileName,
            title,
            status: 'skipped',
            reason: 'Document already exists'
          })
          continue
        }

        // Create document record
        const { data: newDoc, error: insertError } = await supabase
          .from('documents')
          .insert({
            title,
            content,
            source_type: 'upload',
            file_size: Buffer.byteLength(content, 'utf8'),
            file_type: 'text/markdown',
            processing_status: 'pending'
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        // Trigger document processing (async)
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/process-document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: newDoc.id,
            content
          })
        }).catch(error => {
          console.error(`Failed to process document ${newDoc.id}:`, error)
        })

        uploadResults.push({
          fileName,
          title,
          status: 'success',
          documentId: newDoc.id
        })

        successCount++
        console.log(`✓ Uploaded: ${title}`)

      } catch (error) {
        console.error(`✗ Failed to upload ${fileName}:`, error)
        uploadResults.push({
          fileName,
          title: fileName.replace(/\.md$/, ''),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }

    // Log bulk upload analytics
    await supabase
      .from('ai_analytics')
      .insert({
        event_type: 'bulk_upload_completed',
        metadata: {
          source_path: sourcePath,
          total_files: markdownFiles.length,
          success_count: successCount,
          error_count: errorCount,
          files_processed: uploadResults,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      message: `Bulk upload completed: ${successCount} successful, ${errorCount} errors`,
      summary: {
        totalFiles: markdownFiles.length,
        successCount,
        errorCount,
        skippedCount: uploadResults.filter(r => r.status === 'skipped').length
      },
      results: uploadResults
    })

  } catch (error) {
    console.error('Bulk upload API error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check available files for upload
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourcePath = searchParams.get('sourcePath') || 'FabriiQ-docs'

    // Get absolute path
    const fullPath = path.resolve(process.cwd(), sourcePath)
    
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: `Source path does not exist: ${fullPath}` },
        { status: 400 }
      )
    }

    // Read directory contents
    const files = fs.readdirSync(fullPath)
    const markdownFiles = files.filter(file => 
      file.endsWith('.md') && !file.startsWith('.') && file !== 'README.md'
    )

    // Get file stats
    const fileStats = markdownFiles.map(fileName => {
      const filePath = path.join(fullPath, fileName)
      const stats = fs.statSync(filePath)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      return {
        fileName,
        size: stats.size,
        contentLength: content.length,
        title: fileName
          .replace(/\.md$/, '')
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .replace(/^\d+_/, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        lastModified: stats.mtime.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      sourcePath: fullPath,
      totalFiles: markdownFiles.length,
      files: fileStats
    })

  } catch (error) {
    console.error('Bulk upload preview API error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}