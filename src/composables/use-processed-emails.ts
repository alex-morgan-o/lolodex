import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSupabase } from './use-supabase'
import { useAuth } from './use-auth'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ProcessedEmailRecord {
  id: number
  created_at: string
  title: string
  summary: string
  from_email: string
  to_email: string
  raw_id: number | null
  full_text: string | null
}

/**
 * Composable for subscribing to processed email records
 * Subscribes to records where from_email matches the current user's email
 */
export function useProcessedEmails() {
  const supabase = useSupabase()
  const { user } = useAuth()

  const records = ref<ProcessedEmailRecord[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  let channel: RealtimeChannel | null = null

  /**
   * Fetch initial records from the database
   */
  const fetchRecords = async () => {
    if (!user.value?.email) {
      error.value = 'User not authenticated'
      loading.value = false
      return
    }

    try {
      loading.value = true
      const { data, error: fetchError } = await supabase
        .from('processed_email_recrds')
        .select('*')
        .eq('from_email', user.value.email)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      records.value = data || []
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch records'
      console.error('Error fetching processed email records:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Subscribe to realtime changes for the user's accessible records
   */
  const subscribeToRecords = () => {
    if (!user.value?.email) {
      console.warn('Cannot subscribe: User not authenticated')
      return
    }

    // Unsubscribe from any existing channel
    if (channel) {
      supabase.removeChannel(channel)
    }

    // Create a new channel for realtime updates
    channel = supabase
      .channel('processed_email_recrds_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'processed_email_recrds',
          filter: `from_email=eq.${user.value.email}`,
        },
        (payload) => {
          console.log('New record inserted:', payload)
          records.value = [payload.new as ProcessedEmailRecord, ...records.value]
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'processed_email_recrds',
        },
        (payload) => {
          console.log('Record updated:', payload)
          const index = records.value.findIndex(r => r.id === (payload.new as ProcessedEmailRecord).id)
          if (index !== -1) {
            records.value[index] = payload.new as ProcessedEmailRecord
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'processed_email_recrds',
        },
        (payload) => {
          console.log('Record deleted:', payload)
          records.value = records.value.filter(r => r.id !== (payload.old as ProcessedEmailRecord).id)
        }
      )
      .subscribe()
  }

  /**
   * Unsubscribe from realtime changes
   */
  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  /**
   * Initialize subscription and fetch initial data
   */
  const initialize = async () => {
    await fetchRecords()
    subscribeToRecords()
  }

  // Auto-initialize on mount
  onMounted(() => {
    if (user.value) {
      initialize()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    records: computed(() => records.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchRecords,
    subscribeToRecords,
    unsubscribe,
    initialize,
  }
}
