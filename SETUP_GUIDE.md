# FabriiQ Complete Setup Guide

This guide will help you set up the complete FabriiQ system with RLS policies, admin user creation, and document upload functionality.

## 🚀 Quick Setup

### 1. Database Schema Setup

Run the migrations to create the complete database schema with RLS policies:

```bash
# Apply all migrations
supabase db reset

# Or apply individually
supabase migration up
```

The migrations include:
- ✅ `20240101000000_initial_ai_schema.sql` - Core tables (documents, conversations, etc.)
- ✅ `20240101000001_rls_policies.sql` - Row Level Security policies  
- ✅ `20241227000000_add_user_profiles.sql` - User profiles table with roles
- ✅ `20241227000001_create_storage_bucket.sql` - Document storage bucket

### 2. Install Dependencies

```bash
npm install
# This includes the new react-dropzone dependency for file uploads
```

### 3. Environment Variables

Make sure your `.env.local` contains:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Create Your First Admin User

```bash
node scripts/create-admin-user.js
```

Follow the prompts to create an admin user. The script will:
- Create the user in Supabase Auth
- Set admin role in user metadata  
- Create user profile with admin privileges
- Auto-confirm the email

## 🔐 Row Level Security (RLS) Policies

The system now has comprehensive RLS policies:

### Documents & Document Chunks
- ✅ **View**: All authenticated users can read documents and chunks (needed for AI queries)
- ✅ **Manage**: Only admins can create, update, delete documents
- ✅ **Process**: Service role can manage chunks (for AI processing)

### User Profiles  
- ✅ **Self-management**: Users can view/update their own profile (but not role)
- ✅ **Admin oversight**: Admins can view/manage all user profiles
- ✅ **Role protection**: Users cannot escalate their own roles

### Conversations & Messages
- ✅ **Privacy**: Users only see their own conversations and messages
- ✅ **AI integration**: Service role can create AI response messages
- ✅ **Admin monitoring**: Admins can view all conversations (if needed)

### AI Settings & Analytics
- ✅ **Admin only**: Only admins can manage AI configuration
- ✅ **Analytics**: Users see their own analytics, admins see everything
- ✅ **Service access**: Service role can insert analytics events

### Storage (Document Files)
- ✅ **Upload**: Only admins can upload documents  
- ✅ **Access**: Authenticated users can view (needed for processing)
- ✅ **Processing**: Service role has full access for AI processing

## 📄 Document Upload System

### Features
- ✅ **Drag & Drop Interface**: Modern file upload with progress tracking
- ✅ **File Type Validation**: Supports PDF, TXT, MD, DOC, DOCX (max 10MB each)
- ✅ **Batch Processing**: Upload multiple files concurrently
- ✅ **Progress Tracking**: Real-time upload and processing status
- ✅ **Error Handling**: Retry failed uploads, clear error messages
- ✅ **Storage Integration**: Files stored in Supabase Storage with proper security
- ✅ **AI Processing**: Automatic text extraction and embedding generation

### Usage

1. **Admin Login**: Go to `/auth` and sign in with your admin credentials
2. **Access Admin Panel**: You'll be redirected to `/admin` 
3. **Upload Documents**: Use the Documents tab to drag/drop or select files
4. **Monitor Progress**: Watch real-time upload and processing status
5. **View Results**: Uploaded documents appear in the Recent Documents list

### Processing Pipeline

When documents are uploaded:

1. **File Upload**: Document stored in Supabase Storage (`documents` bucket)
2. **Database Record**: Entry created in `documents` table with metadata
3. **Text Extraction**: Supabase Edge Function (`process-document`) extracts text
4. **Chunking**: Text split into manageable chunks with overlap
5. **Embeddings**: Each chunk processed to create vector embeddings  
6. **Storage**: Chunks and embeddings stored in `document_chunks` table
7. **Indexing**: Vector index updated for similarity search

## 🔧 Admin Dashboard Features

### Statistics Overview
- Total users, documents, conversations
- Processing status monitoring  
- Real-time system health

### Document Management
- Upload new documents with drag & drop
- View processing status and history
- Monitor file sizes and types
- Track upload/processing errors

### User Management  
- View all registered users
- Monitor user roles and activity status
- Track registration dates
- (Role editing coming in future update)

### System Settings
- AI model configuration (coming soon)
- Processing parameters  
- System-wide preferences

### Analytics Dashboard
- Usage statistics and insights (coming soon)
- Performance monitoring
- User behavior analysis

## 🛡️ Security Features

### Authentication & Authorization
- ✅ **Secure Auth Flow**: Supabase Auth with email confirmation
- ✅ **Role-Based Access**: Granular permissions for users vs admins
- ✅ **JWT Security**: All API calls validated with JWT tokens
- ✅ **Session Management**: Secure session handling with auto-refresh

### Data Protection  
- ✅ **Row Level Security**: Database-level access control
- ✅ **Storage Policies**: File access restricted by user roles
- ✅ **Input Validation**: File type, size, and content validation
- ✅ **Error Handling**: Secure error messages without data leakage

### Admin Safeguards
- ✅ **Role Protection**: Users cannot self-promote to admin
- ✅ **Multi-layer Validation**: Auth + database + application level checks
- ✅ **Audit Trail**: All admin actions logged to analytics
- ✅ **Safe Defaults**: New users default to regular user role

## 🚦 Testing Your Setup

### 1. Test Regular User Flow
```bash
# Start development server
npm run dev

# Visit http://localhost:3000/auth
# Create a regular user account
# Verify user gets 'user' role in database
# Confirm user cannot access /admin
```

### 2. Test Admin Flow  
```bash
# Use the admin account created earlier
# Sign in at /auth  
# Verify redirect to /admin dashboard
# Test document upload functionality
# Check RLS policies are working
```

### 3. Test RLS Policies
```sql
-- In Supabase SQL Editor, test as different users:

-- As regular user (should fail)
INSERT INTO documents (title, content, source_type) 
VALUES ('Test', 'Content', 'manual');

-- As admin user (should succeed) 
-- First set JWT context for admin user
```

### 4. Test Document Processing
- Upload a sample PDF/document
- Monitor processing status in admin dashboard  
- Check that chunks are created in database
- Verify embeddings are generated
- Test AI queries use the uploaded content

## 🔄 Next Steps

### Immediate Enhancements
- [ ] **Batch Operations**: Bulk document management
- [ ] **Advanced Analytics**: Usage trends and insights  
- [ ] **Role Management UI**: Admin interface for user role changes
- [ ] **Document Categories**: Organize uploads by type/topic
- [ ] **Processing Queue**: Better handling of large document batches

### Future Features
- [ ] **Document Versioning**: Track changes over time
- [ ] **Collaborative Editing**: Multi-user document management
- [ ] **Advanced Search**: Full-text search with filters
- [ ] **API Integration**: External document sources
- [ ] **Backup & Export**: System data management

## 🆘 Troubleshooting

### Common Issues

**"supabase is not exported" Error**
- ✅ Fixed - Added proper export in `lib/supabase/client.ts`

**RLS Policy Denials**  
- Check user has proper role in `user_profiles` table
- Verify JWT token contains correct role metadata
- Test policies in Supabase SQL editor

**Document Upload Fails**
- Ensure storage bucket `documents` exists
- Check file size limits (10MB max)  
- Verify admin user permissions
- Review browser network tab for specific errors

**Admin Dashboard Access Denied**
- Confirm user has `admin` role in `user_profiles` table
- Check user metadata contains `{"role": "admin"}`  
- Verify RLS policies are applied correctly

**Processing Edge Functions Fail**
- Check Supabase Edge Functions are deployed
- Verify environment variables in functions
- Monitor function logs in Supabase dashboard

### Support
For issues not covered here:
1. Check the browser console for JavaScript errors
2. Review Supabase logs for database/auth errors  
3. Test API calls directly in Supabase dashboard
4. Verify environment variables are correct

---

## 📋 Summary

You now have a complete FabriiQ installation with:

✅ **Secure Database Schema** with proper RLS policies  
✅ **Admin User Management** with role-based permissions  
✅ **Document Upload System** with AI processing  
✅ **Modern Admin Dashboard** for system management  
✅ **Storage Integration** with file validation  
✅ **AI-Ready Pipeline** for document processing  

The system is production-ready with enterprise-grade security and scalability built-in!