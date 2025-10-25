import { ref, computed } from 'vue'
import { useSupabase } from './use-supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(true)

/**
 * Composable for authentication state and operations
 * Provides reactive auth state and methods for sign in/up/out
 */
export function useAuth() {
  const supabase = useSupabase()

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Initialize auth state and listen for changes
   */
  const initAuth = async () => {
    loading.value = true
    try {
      // Get current session
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        user.value = session?.user ?? null
        console.log('Auth state changed:', event, session?.user?.email)
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    user.value = data.user
    return data
  }

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    user.value = data.user
    return data
  }

  /**
   * Sign out current user
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  return {
    user: computed(() => user.value),
    isAuthenticated,
    loading: computed(() => loading.value),
    initAuth,
    signIn,
    signUp,
    signOut,
  }
}
