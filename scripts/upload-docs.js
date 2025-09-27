require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Document processing class
class DocumentProcessor {
  constructor(docsPath) {
    this.docsPath = docsPath
    this.chunkSize = 1000
    this.chunkOverlap = 200
  }

  readMarkdownFile(filepath) {
    return fs.readFileSync(filepath, 'utf-8')
  }

  extractTitle(content, filename) {
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

  chunkText(text, title) {
    const chunks = []
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
    
    return chunks.filter(chunk => chunk.trim().length > 50)
  }

  async processFile(filepath) {
    try {
      console.log(`Processing: ${filepath}`)
      
      const content = this.readMarkdownFile(filepath)
      const filename = path.basename(filepath)
      const title = this.extractTitle(content, filename)
      
      // Clean content
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

  getAllMarkdownFiles() {
    const files = []
    
    const scanDirectory = (dir) => {
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

  async processAllDocuments() {
    console.log(`Scanning documents in: ${this.docsPath}`)
    
    const markdownFiles = this.getAllMarkdownFiles()
    console.log(`Found ${markdownFiles.length} markdown files`)
    
    const allChunks = []
    
    for (const file of markdownFiles) {
      const chunks = await this.processFile(file)
      allChunks.push(...chunks)
    }
    
    console.log(`Generated ${allChunks.length} document chunks`)
    return allChunks
  }
}

// Simple embedding generation (mock for now)
async function generateEmbedding(text) {
  // This is a mock - in production you'd use the actual embedding model
  const embedding = new Array(384).fill(0).map(() => Math.random() * 2 - 1)
  return embedding
}

async function uploadToSupabase(chunks) {
  console.log('Uploading documents to FabriiQ website...')
  
  // Don't clear existing documents for website admin
  console.log('ℹ️  Keeping existing documents (website admin mode)')
  
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
        batch.map(chunk => generateEmbedding(chunk.content))
      )
      
      // First, insert documents
      const documents = batch.map(chunk => ({
        title: chunk.title,
        content: chunk.content,
        metadata: chunk.metadata,
        source_type: 'manual',
        processing_status: 'completed'
      }))
      
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
      const chunkInserts = insertedDocs.map((doc, index) => ({
        document_id: doc.id,
        content: batch[index].content,
        chunk_index: 0,
        embedding: embeddings[index],
        metadata: batch[index].metadata,
        token_count: batch[index].metadata.word_count
      }))
      
      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert(chunkInserts)
      
      if (chunkError) {
        throw chunkError
      }
      
      console.log(`Batch ${Math.floor(i/batchSize) + 1} uploaded successfully`)
      successful += batch.length
      
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

// Run the script
main()