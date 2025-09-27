import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton pattern for client-side
let client: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!client) {
    client = createClient()
  }
  return client
}

// Export a default supabase instance for convenience
export const supabase = getSupabaseClient()
