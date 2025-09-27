-- Fix storage bucket MIME type restrictions
-- Update the documents bucket to support all document types properly

-- First, remove existing restrictions by updating the bucket
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/rtf',
  'application/octet-stream', -- Allow generic binary files
  'text/csv',
  'text/html',
  'text/xml',
  'application/json',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint'
]
WHERE id = 'documents';

-- If the bucket doesn't exist, create it with proper MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'documents',
  'documents', 
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/rtf',
    'application/octet-stream', -- Allow generic binary files
    'text/csv',
    'text/html',
    'text/xml',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint'
  ]
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents');

-- Verify the bucket configuration
SELECT id, name, allowed_mime_types, file_size_limit 
FROM storage.buckets 
WHERE id = 'documents';