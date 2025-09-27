# AI Assistant with RAG Implementation Plan

## Overview
This document outlines the implementation plan for adding an AI Assistant with Retrieval Augmented Generation (RAG) capabilities to the FabriiQ platform using Supabase as the backend infrastructure.

## Technology Stack
- **Backend**: Supabase (PostgreSQL with pgvector extension)
- **Vector Search**: Supabase pg_vector
- **Serverless Functions**: Supabase Edge Functions
- **AI/ML**: Hugging Face Transformers (`@huggingface/transformers`)
- **Embedding Model**: Supabase/gte-small
- **Frontend**: React/Remix (existing FabriiQ platform)

## Architecture Overview

```
User Query → Frontend → Edge Function → Vector Search → LLM → Response
                ↓
         Document Processing → Embeddings → Vector Storage
```

## Phase 1: Database Setup & Vector Storage

### 1.1 Supabase Project Setup
- Create new Supabase project or use existing
- Enable pgvector extension
- Set up authentication and RLS policies

### 1.2 Database Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table for storing knowledge base
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  source_type TEXT NOT NULL, -- 'upload', 'web', 'manual'
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Document chunks table for RAG
CREATE TABLE document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(384), -- gte-small produces 384-dimensional embeddings
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE ai_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for vector search
CREATE INDEX document_chunks_embedding_idx ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create indexes for performance
CREATE INDEX documents_source_type_idx ON documents(source_type);
CREATE INDEX document_chunks_document_id_idx ON document_chunks(document_id);
CREATE INDEX conversations_user_id_idx ON conversations(user_id);
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);
```

### 1.3 Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view all documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Admins can manage documents" ON documents FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Document chunks policies
CREATE POLICY "Users can view all document chunks" ON document_chunks FOR SELECT USING (true);
CREATE POLICY "Admins can manage document chunks" ON document_chunks FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Conversations policies
CREATE POLICY "Users can manage their conversations" ON conversations FOR ALL 
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from their conversations" ON messages FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  ));

-- AI settings policies (admin only)
CREATE POLICY "Only admins can manage AI settings" ON ai_settings FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
```

## Phase 2: Edge Functions Setup

### 2.1 Required Edge Functions

#### A. Document Processing Function (`process-document`)
```typescript
// supabase/functions/process-document/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { pipeline } from 'https://esm.sh/@huggingface/transformers@2.6.0'

// Initialize embedding pipeline
const pipe = await pipeline('feature-extraction', 'Supabase/gte-small');

serve(async (req) => {
  try {
    const { documentId, content } = await req.json()
    
    // Split content into chunks (approximately 500 characters with overlap)
    const chunks = splitIntoChunks(content, 500, 50)
    
    // Generate embeddings for each chunk
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await pipe(chunk.content, {
          pooling: 'mean',
          normalize: true,
        })
        
        return {
          content: chunk.content,
          chunk_index: index,
          embedding: Array.from(embedding.data),
          metadata: chunk.metadata
        }
      })
    )
    
    // Store chunks in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const { error } = await supabase
      .from('document_chunks')
      .insert(
        chunksWithEmbeddings.map(chunk => ({
          document_id: documentId,
          ...chunk
        }))
      )
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ success: true, chunksProcessed: chunks.length }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function splitIntoChunks(text: string, chunkSize: number, overlap: number) {
  const chunks = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const content = text.slice(start, end)
    
    chunks.push({
      content: content.trim(),
      metadata: {
        start_index: start,
        end_index: end,
        length: content.length
      }
    })
    
    start += chunkSize - overlap
  }
  
  return chunks
}
```

#### B. Chat Function (`ai-chat`)
```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { pipeline } from 'https://esm.sh/@huggingface/transformers@2.6.0'

const pipe = await pipeline('feature-extraction', 'Supabase/gte-small');

serve(async (req) => {
  try {
    const { message, conversationId, userId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // Generate embedding for user query
    const queryEmbedding = await pipe(message, {
      pooling: 'mean',
      normalize: true,
    })
    
    // Perform vector search
    const { data: relevantChunks } = await supabase.rpc('match_documents', {
      query_embedding: Array.from(queryEmbedding.data),
      similarity_threshold: 0.7,
      match_count: 5
    })
    
    // Get conversation history
    const { data: conversationHistory } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)
    
    // Build context from relevant chunks
    const context = relevantChunks
      ?.map(chunk => chunk.content)
      .join('\n\n') || ''
    
    // Generate response using OpenAI API or local model
    const response = await generateResponse({
      message,
      context,
      history: conversationHistory || []
    })
    
    // Save messages to database
    await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        role: 'user',
        content: message
      },
      {
        conversation_id: conversationId,
        role: 'assistant',
        content: response
      }
    ])
    
    return new Response(
      JSON.stringify({ response }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function generateResponse({ message, context, history }) {
  // Integration with OpenAI API or local LLM
  const systemPrompt = `You are FabriiQ's AI assistant. Use the following context to answer questions about educational management and platform features.

Context:
${context}

Previous conversation:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

Answer the user's question based on the context provided. If the context doesn't contain relevant information, say so politely.`

  // Replace with actual LLM API call
  return "AI response based on context and query"
}
```

#### C. Vector Search SQL Function
```sql
-- Create the vector search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(384),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > similarity_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Phase 3: Admin Dashboard

### 3.1 Admin Routes Structure
```
/admin
├── /dashboard          # Overview and analytics
├── /documents         # Document management
├── /knowledge-base    # Knowledge base management
├── /conversations     # View all conversations
├── /settings          # AI settings configuration
└── /users            # User management
```

### 3.2 Document Management Interface
```typescript
// app/routes/admin.documents.tsx
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { createSupabaseServerClient } from '~/utils/supabase.server'

export const loader = async ({ request }) => {
  const supabase = createSupabaseServerClient({ request })
  
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    
  return json({ documents })
}

export default function AdminDocuments() {
  const { documents } = useLoaderData<typeof loader>()
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <button className="bg-primary-green text-white px-4 py-2 rounded-lg">
          Upload Document
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <DocumentRow key={doc.id} document={doc} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### 3.3 Knowledge Base Management
```typescript
// app/routes/admin.knowledge-base.tsx
import { useState } from 'react'
import { useFetcher } from '@remix-run/react'

export default function KnowledgeBase() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const processFetcher = useFetcher()
  
  const handleFileUpload = async (files) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('action', 'upload-document')
      
      processFetcher.submit(formData, {
        method: 'post',
        encType: 'multipart/form-data'
      })
    }
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base Management</h1>
      
      {/* File Upload Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
        <DocumentUploader onUpload={handleFileUpload} />
      </div>
      
      {/* Bulk Processing Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Batch Processing</h2>
        <button 
          className="bg-accent-blue text-white px-4 py-2 rounded"
          onClick={() => {/* Trigger batch processing */}}
        >
          Reprocess All Documents
        </button>
      </div>
      
      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KnowledgeBaseStats />
      </div>
    </div>
  )
}
```

## Phase 4: Frontend Integration

### 4.1 AI Chat Component
```typescript
// app/components/AIChat.tsx
import { useState, useRef, useEffect } from 'react'
import { useFetcher } from '@remix-run/react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatFetcher = useFetcher()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    // Call AI chat edge function
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        conversationId: 'current-conversation-id'
      })
    })
    
    const data = await response.json()
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.response,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, aiMessage])
    setIsLoading(false)
  }
  
  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white">
      {/* Chat Header */}
      <div className="bg-primary-green text-white p-4 rounded-t-lg">
        <h3 className="font-semibold">FabriiQ AI Assistant</h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary-green text-white'
                  : 'bg-light-mint text-dark-gray'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-light-mint text-dark-gray px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-medium-gray rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-medium-gray rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-medium-gray rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about FabriiQ..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-primary-green"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-medium-teal transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 4.2 API Route for Chat
```typescript
// app/routes/api.ai-chat.tsx
import { json } from '@remix-run/node'
import { createSupabaseServerClient } from '~/utils/supabase.server'

export const action = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }
  
  try {
    const supabase = createSupabaseServerClient({ request })
    const { message, conversationId } = await request.json()
    
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        message,
        conversationId,
        userId: 'current-user-id' // Get from auth
      }
    })
    
    if (error) throw error
    
    return json(data)
    
  } catch (error) {
    return json({ error: error.message }, { status: 500 })
  }
}
```

## Phase 5: Deployment & Configuration

### 5.1 Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration (if using OpenAI for LLM)
OPENAI_API_KEY=your-openai-api-key

# Hugging Face (if needed for custom models)
HUGGINGFACE_API_TOKEN=your-hf-token
```

### 5.2 Package Dependencies
```json
{
  "dependencies": {
    "@huggingface/transformers": "^2.6.0",
    "@supabase/supabase-js": "^2.38.0",
    "openai": "^4.20.0"
  }
}
```

### 5.3 Deployment Steps
1. **Database Setup**
   ```bash
   # Deploy database schema
   supabase db push

   # Deploy edge functions
   supabase functions deploy process-document
   supabase functions deploy ai-chat
   ```

2. **Frontend Deployment**
   ```bash
   # Install dependencies
   npm install @huggingface/transformers @supabase/supabase-js

   # Build and deploy
   npm run build
   npm run deploy
   ```

## Phase 6: Testing & Optimization

### 6.1 Testing Strategy
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test vector search performance and response times

### 6.2 Performance Optimization
- **Vector Index Tuning**: Optimize ivfflat index parameters
- **Caching**: Implement Redis caching for frequent queries
- **Chunking Strategy**: Optimize chunk size and overlap
- **Model Selection**: Evaluate different embedding models

## Phase 7: Monitoring & Analytics

### 7.1 Metrics to Track
- Query response times
- Vector search accuracy
- User engagement with AI assistant
- Document processing success rates
- Token usage and costs

### 7.2 Monitoring Setup
```sql
-- Analytics tables
CREATE TABLE ai_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ai_analytics_event_type_idx ON ai_analytics(event_type);
CREATE INDEX ai_analytics_created_at_idx ON ai_analytics(created_at);
```

## Implementation Timeline

### Week 1-2: Foundation
- Set up Supabase project and database schema
- Implement basic vector storage and search
- Create document processing pipeline

### Week 3-4: Core Features
- Develop Edge Functions for AI chat and document processing
- Build admin dashboard for document management
- Implement basic RAG functionality

### Week 5-6: Integration & UI
- Integrate AI chat component into main application
- Develop knowledge base management interface
- Add user conversation management

### Week 7-8: Testing & Optimization
- Performance testing and optimization
- Security audit and RLS policy refinement
- User acceptance testing

### Week 9-10: Deployment & Monitoring
- Production deployment
- Monitoring setup and analytics implementation
- Documentation and training

## Security Considerations

1. **Authentication & Authorization**
   - Implement proper RLS policies
   - Validate user permissions for all operations
   - Secure API endpoints

2. **Data Privacy**
   - Encrypt sensitive data
   - Implement data retention policies
   - GDPR compliance for user data

3. **Rate Limiting**
   - Implement rate limiting for AI requests
   - Monitor and prevent abuse
   - Cost control mechanisms

## Success Metrics

1. **Technical Metrics**
   - Vector search accuracy > 80%
   - Average response time < 2 seconds
   - 99.9% uptime

2. **User Metrics**
   - User engagement with AI assistant
   - Query success rate
   - User satisfaction scores

3. **Business Metrics**
   - Reduced support ticket volume
   - Increased user retention
   - Feature adoption rates

This comprehensive plan provides a structured approach to implementing AI Assistant with RAG capabilities using Supabase infrastructure, ensuring scalability, security, and optimal user experience.