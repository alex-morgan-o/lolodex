<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '../composables/use-supabase'
import { useProcessedEmails, type ProcessedEmailRecord } from '../composables/use-processed-emails'
import { useAuth } from '../composables/use-auth'

const route = useRoute()
const router = useRouter()
const supabase = useSupabase()
const { user } = useAuth()
const { records, initialize } = useProcessedEmails()

const idParam = computed(() => Number(route.params.id))

const record = ref<ProcessedEmailRecord | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showOriginal = ref(false)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const fetchRecord = async () => {
  try {
    loading.value = true
    error.value = null
    showOriginal.value = false

    if (!idParam.value || Number.isNaN(idParam.value)) {
      error.value = 'Invalid record id'
      record.value = null
      return
    }

    // Try local cache first
    const local = records.value?.find((r) => r.id === idParam.value)
    if (local) {
      record.value = local
      return
    }

    // Ensure list is initialized in case we navigated directly
    await initialize()
    const afterInit = records.value?.find((r) => r.id === idParam.value)
    if (afterInit) {
      record.value = afterInit
      return
    }

    // Fallback: fetch from Supabase by id and (if available) by user email
    let query = supabase
      .from('processed_email_recrds')
      .select('*')
      .eq('id', idParam.value)

    if (user.value?.email) {
      query = query.eq('from_email', user.value.email)
    }

    const { data, error: fetchError } = await query.single()
    if (fetchError) throw fetchError
    record.value = (data ?? null) as ProcessedEmailRecord | null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load record'
  } finally {
    loading.value = false
  }
}

onMounted(fetchRecord)
watch(idParam, fetchRecord)

const goBack = () => router.push('/')
</script>

<template>
  <div class="detail-container">
    <div class="detail-header">
      <button class="back-button" @click="goBack" aria-label="Back to list" title="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>Back</span>
      </button>
    </div>

    <div v-if="loading" class="state-box">Loading…</div>
    <div v-else-if="error" class="state-box error">{{ error }}</div>
    <div v-else-if="!record" class="state-box">Record not found.</div>

    <div v-else class="detail-content">
      <h1 class="title">{{ record.title || 'Untitled' }}</h1>
      <div class="meta">
        <span v-if="record.from_email">From: {{ record.from_email }}</span>
        <span v-if="record.to_email">To: {{ record.to_email }}</span>
        <span v-if="record.created_at">{{ formatDate(record.created_at) }}</span>
      </div>

      <div v-if="record.summary" class="summary">{{ record.summary }}</div>

      <div class="body">
        <template v-if="record.full_text">
          <button class="toggle-original" @click="showOriginal = !showOriginal">
            {{ showOriginal ? 'Hide original message' : 'See original message' }}
          </button>
          <pre v-if="showOriginal" class="full-text">{{ record.full_text }}</pre>
        </template>
        <div v-else class="no-text">No full content available.</div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.detail-container {
  padding: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #fff;
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.back-button:hover { background: rgba(255, 255, 255, 0.05); }

.detail-content { padding-top: 24px; }

.title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #aaa;
  font-size: 13px;
  margin-bottom: 16px;
}

.summary {
  color: #ccc;
  font-size: 14px;
  margin-bottom: 16px;
}

.body { background: transparent; }

.toggle-original {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  margin-bottom: 12px;
}

.toggle-original:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.18);
}

.full-text {
  white-space: pre-wrap;
  color: #ddd;
  font-size: 14px;
  line-height: 1.6;
}

.no-text { color: #888; font-size: 14px; }

.state-box { color: #aaa; padding: 32px 0; }
.state-box.error { color: #ff6b6b; }

@media (max-width: 768px) {
  .detail-container { padding: 24px; }
  .title { font-size: 20px; }
}
</style>
