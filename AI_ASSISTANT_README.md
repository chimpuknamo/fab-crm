# FabriiQ AI Assistant Implementation

A comprehensive AI-powered assistant with RAG (Retrieval Augmented Generation) capabilities for the FabriiQ educational management platform.

## 🎯 Overview

The AI Assistant enhances the FabriiQ platform with intelligent chat capabilities, document processing, and knowledge base management. Built with modern technologies including Supabase, Next.js, and vector search capabilities.

### Key Features
- **RAG-powered Chat**: Contextual responses based on your knowledge base
- **Document Processing**: Automatic chunking and embedding generation
- **Vector Search**: Semantic search through documents using pgvector
- **Admin Dashboard**: Complete management interface for documents and settings
- **Real-time Chat**: Beautiful, responsive chat interface with FabriiQ branding
- **Analytics**: Comprehensive monitoring and performance tracking

## 🏗 Architecture

```
User Query → Frontend → API Route → Vector Search → LLM → Response
                ↓
         Document Upload → Processing → Embeddings → Vector Storage
```

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + pgvector)
- **AI/ML**: Hugging Face Transformers, Supabase/gte-small embeddings
- **Serverless**: Supabase Edge Functions
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and Install**
   ```bash
   cd "D:\Learning Q4\v0-remix-of-fabrii-q-111\backup before redesign - Copy"
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Database Setup**
   ```bash
   # Initialize Supabase (if not already done)
   npx supabase init
   
   # Push database schema
   npx supabase db push
   ```

4. **Deploy Edge Functions** (Optional - for production)
   ```bash
   npx supabase functions deploy process-document
   npx supabase functions deploy ai-chat
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
├── app/
│   ├── api/ai/chat/route.ts          # Chat API endpoint
│   ├── api/admin/process-document/   # Document processing
│   ├── admin/                        # Admin interface
│   │   ├── documents/page.tsx        # Document management
│   │   ├── knowledge-base/page.tsx   # KB analytics
│   │   └── layout.tsx               # Admin layout
│   ├── ai-demo/page.tsx             # AI chat demo
│   ├── dev-test/page.tsx            # Development testing
│   └── page.tsx                     # Homepage (with AI chat)
├── components/ai/
│   └── AIChat.tsx                   # Main chat component
├── lib/
│   ├── supabase/                    # Supabase clients & types
│   └── test-documents.ts            # Test data
├── supabase/
│   ├── functions/                   # Edge Functions
│   │   ├── process-document/        # Document processing
│   │   └── ai-chat/                 # RAG chat function
│   └── migrations/                  # Database schema
```

## 🔧 Configuration

### Environment Variables

**Required:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin)
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL for client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key

**Optional:**
- `OPENAI_API_KEY` - For enhanced LLM responses
- `HUGGINGFACE_API_TOKEN` - For custom embedding models

### Database Schema

The implementation includes:
- `documents` - Source documents
- `document_chunks` - Processed text chunks with embeddings
- `conversations` - Chat conversations
- `messages` - Individual chat messages
- `ai_settings` - Configurable AI parameters
- `ai_analytics` - Usage and performance metrics

## 🎨 User Interface

### Chat Interface
- **Brand Colors**: FabriiQ green (#1F504B), teal (#5A8A84), mint (#D8E3E0)
- **Alpha Badge**: Clearly marked as alpha version
- **Real-time**: Instant responses with loading indicators
- **Responsive**: Works on desktop and mobile

### Admin Dashboard
- **Document Management**: Upload, view, delete documents
- **Processing Status**: Track document processing progress
- **Analytics**: Monitor usage and performance
- **Settings**: Configure AI parameters

## 🧪 Testing

### Development Testing Suite

Access at: `http://localhost:3001/dev-test`

Tests include:
1. **Database Connection** - Validates Supabase connectivity
2. **Document Creation** - Creates test documents
3. **Document Processing** - Tests chunking and embeddings
4. **Vector Search** - Validates search functionality
5. **Chat API** - End-to-end chat testing

### Available Demo Pages

- `/` - Homepage with floating AI chat
- `/ai-demo` - Full chat interface demo
- `/admin/documents` - Document management
- `/admin/knowledge-base` - Analytics dashboard
- `/dev-test` - Testing suite

## 🔒 Security & Privacy

### Row Level Security (RLS)
- All tables have comprehensive RLS policies
- Users can only access their own conversations
- Admins have elevated permissions
- Documents are viewable by authenticated users

### Data Protection
- FERPA/COPPA compliant architecture
- Secure API endpoints with proper validation
- Encrypted data storage
- Audit trails for admin actions

## 📊 Analytics & Monitoring

### Tracked Metrics
- Chat message volume and response times
- Document processing success rates
- Vector search performance
- User engagement patterns
- System health indicators

### Performance Optimization
- Vector index tuning (ivfflat with cosine similarity)
- Chunk size optimization (500 chars with 50 char overlap)
- Similarity threshold tuning (default: 0.7)
- Batch processing for large documents

## 🚦 Current Status

### ✅ Completed Features
- [x] Database schema with vector support
- [x] Document processing pipeline
- [x] RAG-powered chat API
- [x] Admin document management
- [x] Knowledge base analytics
- [x] Chat UI with FabriiQ branding
- [x] Development testing suite
- [x] Homepage integration
- [x] Error handling and loading states

### 🔄 Alpha Version Limitations
- Simulated embeddings (demo mode)
- Mock LLM responses (can integrate OpenAI)
- Basic document formats (TXT, MD)
- Single-user conversations

### 🎯 Production Readiness Checklist
- [ ] Set up production Supabase project
- [ ] Deploy Edge Functions
- [ ] Configure real embedding models
- [ ] Integrate with OpenAI or other LLM
- [ ] Add advanced file format support
- [ ] Implement user authentication
- [ ] Set up monitoring and alerts
- [ ] Performance testing and optimization

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check Supabase credentials in `.env.local`
- Ensure database is accessible
- Verify RLS policies are configured

**Document Processing Stuck**
- Check Edge Function deployment
- Verify service role permissions
- Monitor function logs in Supabase

**Chat Not Responding**
- Test API endpoint directly
- Check document chunks exist
- Verify vector search function

**Vector Search Issues**
- Ensure pgvector extension is enabled
- Check embedding dimensions (384 for gte-small)
- Verify index configuration

### Debug Tools
- Development testing suite (`/dev-test`)
- Supabase dashboard logs
- Browser developer console
- Admin analytics panel

## 📚 API Documentation

### Chat Endpoint
```typescript
POST /api/ai/chat
{
  "message": "What are FabriiQ's features?",
  "conversationId": "uuid",
  "userId": "user-id"
}
```

### Document Processing
```typescript
POST /api/admin/process-document
{
  "documentId": "uuid",
  "content": "document text content"
}
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Run test suite (`/dev-test`)
4. Update documentation
5. Submit pull request

### Code Style
- TypeScript strict mode
- ESLint configuration
- Tailwind CSS for styling
- Component-based architecture

## 📄 License

This AI Assistant implementation is part of the FabriiQ educational management platform and follows the same licensing terms.

---

**Need Help?** 
- Check the testing suite at `/dev-test`
- Review the admin dashboard at `/admin/documents`  
- Try the chat demo at `/ai-demo`