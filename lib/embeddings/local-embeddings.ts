import { pipeline, env } from '@xenova/transformers';

// Disable remote models and set cache directory
env.allowRemoteModels = true;
env.allowLocalModels = true;

class LocalEmbeddingService {
  private static instance: LocalEmbeddingService;
  private pipeline: any = null;
  private isInitialized = false;

  public static getInstance(): LocalEmbeddingService {
    if (!LocalEmbeddingService.instance) {
      LocalEmbeddingService.instance = new LocalEmbeddingService();
    }
    return LocalEmbeddingService.instance;
  }

  private constructor() {}

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing local embedding model (Supabase/gte-small)...');
      
      // Initialize the embedding pipeline
      this.pipeline = await pipeline(
        'feature-extraction',
        'Supabase/gte-small',
        {
          // Configure to use local cache
          cache_dir: './models/cache',
          local_files_only: false, // Allow download on first use
          revision: 'main'
        }
      );
      
      this.isInitialized = true;
      console.log('Local embedding model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize embedding model:', error);
      throw new Error(`Embedding model initialization failed: ${error.message}`);
    }
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Generate embeddings
      const output = await this.pipeline(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert to regular array
      const embedding = Array.from(output.data) as number[];
      
      // Validate embedding dimensions (gte-small should produce 384-dimensional vectors)
      if (embedding.length !== 384) {
        console.warn(`Unexpected embedding dimension: ${embedding.length}, expected 384`);
      }

      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const embeddings: number[][] = [];
      
      // Process in batches to avoid memory issues
      const batchSize = 10;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchEmbeddings = await Promise.all(
          batch.map(text => this.generateEmbedding(text))
        );
        embeddings.push(...batchEmbeddings);
      }

      return embeddings;
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw new Error(`Batch embedding generation failed: ${error.message}`);
    }
  }

  public getModelInfo() {
    return {
      name: 'Supabase/gte-small',
      dimensions: 384,
      maxLength: 512, // Typical max sequence length for this model
      isInitialized: this.isInitialized
    };
  }
}

// Export singleton instance
export const localEmbeddings = LocalEmbeddingService.getInstance();

// Helper function for easy use
export async function generateEmbedding(text: string): Promise<number[]> {
  return localEmbeddings.generateEmbedding(text);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  return localEmbeddings.generateEmbeddings(texts);
}