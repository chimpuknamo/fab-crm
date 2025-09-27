-- Improve the vector search function to exclude short, unhelpful chunks
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(384),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  min_content_length int DEFAULT 200  -- Add minimum content length filter
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity,
    document_chunks.metadata
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > similarity_threshold
    AND LENGTH(document_chunks.content) >= min_content_length  -- Filter out short chunks
    AND document_chunks.embedding IS NOT NULL  -- Ensure embedding exists
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;