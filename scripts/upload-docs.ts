import * as fs from 'fs'
import * as path from 'path'
import { supabase } from '../lib/supabase/server'
import { localEmbeddings } from '../lib/embeddings/local-embeddings'

interface DocumentChunk {
  title: string
  content: string
  metadata: {
    filename: string
    filepath: string
    section?: string
    word_count: number
  }
}

class DocumentProcessor {
  private readonly docsPath: string
  private readonly chunkSize = 1000
  private readonly chunkOverlap = 200

  constructor(docsPath: string) {
    this.docsPath = docsPath
  }

  private async readMarkdownFile(filepath: string): Promise<string> {
    return fs.readFileSync(filepath, 'utf-8')
  }

  private extractTitle(content: string, filename: string): string {
    // Try to extract title from first # heading
    const titleMatch = content.match(/^#\s+(.+)/m)
    if (titleMatch) {
      return titleMatch[1].trim()
    }
    
    // Fallback to filename
    return path.basename(filename, path.extname(filename))
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
  }

  private chunkText(text: string, title: string): string[] {
    const chunks: string[] = []
    const sentences = text.split(/(?<=[.!?])\s+/)
    
    let currentChunk = ''
    
    for (const sentence of sentences) {
      const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence
      
      if (testChunk.length > this.chunkSize && currentChunk) {
        // Add overlap from the end of previous chunk
        const overlapStart = Math.max(0, currentChunk.length - this.chunkOverlap)
        const overlap = currentChunk.substring(overlapStart)
        
        chunks.push(currentChunk)
        currentChunk = overlap + ' ' + sentence
      } else {
        currentChunk = testChunk
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk)
    }
    
    return chunks.filter(chunk => chunk.trim().length > 50) // Filter out very small chunks
  }

  private async processFile(filepath: string): Promise<DocumentChunk[]> {
    try {
      console.log(`Processing: ${filepath}`)
      
      const content = await this.readMarkdownFile(filepath)
      const filename = path.basename(filepath)
      const title = this.extractTitle(content, filename)
      
      // Clean content (remove excessive whitespace, markdown artifacts)
      const cleanContent = content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/#{1,6}\s+/g, '') // Remove markdown headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
        .trim()

      if (cleanContent.length < 100) {
        console.log(`Skipping ${filename}: content too short`)
        return []
      }

      const chunks = this.chunkText(cleanContent, title)
      
      return chunks.map((chunk, index) => ({
        title: chunks.length > 1 ? `${title} (Part ${index + 1})` : title,
        content: chunk,
        metadata: {
          filename,
          filepath: path.relative(this.docsPath, filepath),
          section: chunks.length > 1 ? `part_${index + 1}` : undefined,
          word_count: chunk.split(/\s+/).length
        }
      }))
    } catch (error) {
      console.error(`Error processing ${filepath}:`, error)
      return []
    }
  }

  private async getAllMarkdownFiles(): Promise<string[]> {
    const files: string[] = []
    
    const scanDirectory = (dir: string): void => {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath)
        } else if (item.endsWith('.md')) {
          files.push(fullPath)
        }
      }
    }
    
    scanDirectory(this.docsPath)
    return files
  }

  public async processAllDocuments(): Promise<DocumentChunk[]> {
    console.log(`Scanning documents in: ${this.docsPath}`)
    
    const markdownFiles = await this.getAllMarkdownFiles()
    console.log(`Found ${markdownFiles.length} markdown files`)
    
    const allChunks: DocumentChunk[] = []
    
    for (const file of markdownFiles) {
      const chunks = await this.processFile(file)
      allChunks.push(...chunks)
    }
    
    console.log(`Generated ${allChunks.length} document chunks`)
    return allChunks
  }
}

async function uploadToSupabase(chunks: DocumentChunk[]): Promise<void> {
  console.log('Initializing local embeddings...')
  await localEmbeddings.initialize()
  
  console.log('Clearing existing documents and chunks...')
  
  // First clear chunks (due to foreign key constraint)
  const { error: chunksDeleteError } = await supabase
    .from('document_chunks')
    .delete()
    .gte('created_at', '1970-01-01')
  
  if (chunksDeleteError) {
    console.error('Error clearing existing chunks:', chunksDeleteError)
  }
  
  // Then clear documents
  const { error: docsDeleteError } = await supabase
    .from('documents')
    .delete()
    .gte('created_at', '1970-01-01')
  
  if (docsDeleteError) {
    console.error('Error clearing existing documents:', docsDeleteError)
  }
  
  console.log(`Uploading ${chunks.length} document chunks...`)
  
  const batchSize = 5
  let successful = 0
  let failed = 0
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`)
    
    try {
      // Generate embeddings for the batch
      const embeddings = await Promise.all(
        batch.map(chunk => localEmbeddings.generateEmbedding(chunk.content))
      )
      
      // First, insert documents without embeddings
      const documents = batch.map(chunk => ({
        title: chunk.title,
        content: chunk.content,
        metadata: chunk.metadata,
        source_type: 'manual' as const,
        processing_status: 'completed' as const
      }))
      
      // Insert documents first
      const { data: insertedDocs, error: docError } = await supabase
        .from('documents')
        .insert(documents)
        .select('id')
      
      if (docError) {
        throw docError
      }
      
      if (!insertedDocs || insertedDocs.length === 0) {
        throw new Error('No documents were inserted')
      }
      
      // Then insert document chunks with embeddings
      const chunks = insertedDocs.map((doc, index) => ({
        document_id: doc.id,
        content: batch[index].content,
        chunk_index: 0,
        embedding: embeddings[index],
        metadata: batch[index].metadata,
        token_count: batch[index].metadata.word_count
      }))
      
      // Insert chunks with embeddings
      const { error } = await supabase
        .from('document_chunks')
        .insert(chunks)
      
      if (error) {
        console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, error)
        failed += batch.length
      } else {
        console.log(`Batch ${Math.floor(i/batchSize) + 1} uploaded successfully`)
        successful += batch.length
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`Error processing batch ${Math.floor(i/batchSize) + 1}:`, error)
      failed += batch.length
    }
  }
  
  console.log(`\nUpload complete!`)
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
}

async function main() {
  try {
    const docsPath = path.join(process.cwd(), 'FabriiQ-docs')
    
    if (!fs.existsSync(docsPath)) {
      throw new Error(`Documentation directory not found: ${docsPath}`)
    }
    
    console.log('=== FabriiQ Documentation Upload ===\n')
    
    const processor = new DocumentProcessor(docsPath)
    const chunks = await processor.processAllDocuments()
    
    if (chunks.length === 0) {
      console.log('No documents to process')
      return
    }
    
    console.log('\n=== Uploading to Supabase ===\n')
    await uploadToSupabase(chunks)
    
    console.log('\n=== Complete! ===')
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { DocumentProcessor, uploadToSupabase }