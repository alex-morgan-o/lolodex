<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/use-auth'
import { useSupabase } from '@/composables/use-supabase'

const router = useRouter()
const supabase = useSupabase()
const { user } = useAuth()

const fullName = ref('')
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const loadFromUser = () => {
  const current = user.value
  if (!current) return
  const fromMeta = (current.user_metadata as Record<string, any> | undefined)?.full_name
  fullName.value = (fromMeta ?? '').toString()
}

onMounted(() => {
  loadFromUser()
})

watch(() => user.value, () => {
  loadFromUser()
})

const save = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  saving.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.value.trim() },
    })
    if (error) throw error
    successMessage.value = 'Saved successfully'
  } catch (err: any) {
    errorMessage.value = err?.message || 'Failed to save changes'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1 class="title">Settings</h1>
      <div class="header-actions">
        <button class="btn" @click="goBack">Back</button>
      </div>
    </div>

    <form class="card" @submit.prevent="save">
      <div class="form-row">
        <label for="fullName" class="label">Full name</label>
        <input
          id="fullName"
          type="text"
          v-model="fullName"
          :disabled="saving"
          class="input"
          placeholder="Your full name"
        />
      </div>

      <div class="actions">
        <button type="submit" class="btn primary" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>

      <p v-if="successMessage" class="msg success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="msg error">{{ errorMessage }}</p>
    </form>
  </div>
  
</template>

<style scoped>
.settings-container {
  padding: 24px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
}

.card {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 13px;
  color: #aaa;
}

.input {
  width: 100%;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0 12px;
  color: #ffffff;
  font-size: 14px;
}

.input:disabled {
  opacity: 0.7;
}

.actions {
  margin-top: 16px;
}

.btn {
  height: 36px;
  padding: 0 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn.primary {
  border-color: rgba(255, 255, 255, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.msg {
  margin-top: 12px;
  font-size: 13px;
}

.msg.success {
  color: #7cd992;
}

.msg.error {
  color: #ff6b6b;
}
</style>
