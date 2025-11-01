<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
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

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

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

const normalizeMarkdownSpacing = (value: string) =>
  value
    .replace(/^(\s*[-*+])(\*\*|__)/gm, '$1 $2')
    .replace(/(\*\*|__)([\s\S]*?)(\1)/g, (_match, marker, inner) => {
      const trimmed = inner.replace(/^\s+|\s+$/g, '')
      return `${marker}${trimmed}${marker}`
    })

const renderMarkdown = (value: string | null | undefined) => {
  if (!value) return ''
  const normalized = normalizeMarkdownSpacing(value)
  return DOMPurify.sanitize(markdown.render(normalized))
}

const summaryHtml = computed(() => renderMarkdown(record.value?.summary))
const fullTextHtml = computed(() => renderMarkdown(record.value?.full_text))

const titleText = computed(() => {
  const raw = record.value?.title || 'Untitled'
  const normalized = normalizeMarkdownSpacing(raw)
  const html = markdown.render(normalized)
  const stripped = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  return stripped.trim()
})
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
      <h1 class="title">{{ titleText }}</h1>
      <div class="meta">
        <span v-if="record.from_email">From: {{ record.from_email }}</span>
        <span v-if="record.created_at">{{ formatDate(record.created_at) }}</span>
      </div>

      <div v-if="summaryHtml" class="notion-card">
        <div class="notion-content" v-html="summaryHtml" />
      </div>

      <div class="body">
        <template v-if="fullTextHtml">
          <div class="notion-card">
            <div class="notion-content" v-html="fullTextHtml" />
          </div>
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

.body { background: transparent; }

.no-text { color: #888; font-size: 14px; }

.state-box { color: #aaa; padding: 32px 0; }
.state-box.error { color: #ff6b6b; }

.notion-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(14px);
}

.notion-heading {
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9aa5b1;
  margin-bottom: 12px;
}

.notion-content {
  color: #f5f6f7;
  font-size: 15px;
  line-height: 1.7;
  font-feature-settings: 'liga' on, 'kern' on;
}

.notion-content h1,
.notion-content h2,
.notion-content h3,
.notion-content h4,
.notion-content h5,
.notion-content h6 {
  margin: 20px 0 12px;
  font-weight: 600;
  line-height: 1.3;
  color: #fff;
}

.notion-content p {
  margin: 12px 0;
}

.notion-content ul,
.notion-content ol {
  margin: 12px 0;
  padding-left: 22px;
}

.notion-content li {
  margin: 8px 0;
}

.notion-content blockquote {
  margin: 16px 0;
  padding-left: 16px;
  border-left: 3px solid rgba(255, 255, 255, 0.15);
  color: #d6daf0;
  font-style: italic;
}

.notion-content code {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 13px;
}

.notion-content pre {
  background: rgba(15, 23, 42, 0.85);
  border-radius: 12px;
  padding: 14px 16px;
  overflow-x: auto;
  margin: 16px -12px;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.notion-content a {
  color: #6ab6ff;
  text-decoration: none;
  border-bottom: 1px solid rgba(106, 182, 255, 0.35);
  transition: border-color 0.2s ease;
}

.notion-content a:hover {
  border-color: rgba(106, 182, 255, 0.8);
}

@media (max-width: 768px) {
  .detail-container { padding: 24px; }
  .title { font-size: 20px; }
}
</style>
