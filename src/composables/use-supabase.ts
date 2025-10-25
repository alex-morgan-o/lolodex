import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Create a single supabase client for interacting with your database
let supabaseClient: SupabaseClient | null = null;

/**
 * Composable for accessing Supabase client
 * Provides access to authentication, database, storage, and realtime features
 *
 * @returns {SupabaseClient} The Supabase client instance
 *
 * @example
 * ```ts
 * import { useSupabase } from '@/composables/use-supabase'
 *
 * const supabase = useSupabase()
 *
 * // Authentication
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'example@email.com',
 *   password: 'password'
 * })
 *
 * // Database queries
 * const { data: users } = await supabase
 *   .from('users')
 *   .select('*')
 *
 * // Storage
 * const { data: files } = await supabase
 *   .storage
 *   .from('bucket-name')
 *   .list()
 * ```
 */
export function useSupabase(): SupabaseClient {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        "Supabase URL and Anon Key must be provided. " +
          "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
      );
    }

    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseClient;
}

/**
 * Get the current authenticated user
 *
 * @example
 * ```ts
 * const user = await useSupabaseUser()
 * console.log(user?.email)
 * ```
 */
export async function useSupabaseUser() {
  const supabase = useSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign out the current user
 *
 * @example
 * ```ts
 * await useSupabaseSignOut()
 * ```
 */
export async function useSupabaseSignOut() {
  const supabase = useSupabase();
  const { error } = await supabase.auth.signOut();
  return { error };
}
