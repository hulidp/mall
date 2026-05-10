<template>
  <section class="border-y border-gray-100 bg-white p-4 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-5 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-lg font-black text-gray-950 dark:text-white sm:text-xl">{{ t('personalCenter.apiPanel.title') }}</h2>
        <p class="mt-1 break-words text-sm leading-6 text-gray-500 dark:text-gray-400">{{ t('personalCenter.apiPanel.subtitle') }}</p>
      </div>
    </div>

    <div v-if="panelAlert" class="mt-4 rounded-xl border px-4 py-3 text-sm" :class="mallAlertClass(panelAlert.level)">
      {{ panelAlert.message }}
    </div>

    <div v-if="loading" class="mt-5 space-y-3">
      <div v-for="idx in 3" :key="idx" class="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"></div>
    </div>

    <div v-else-if="!credential" class="mt-5 rounded-2xl border border-dashed border-gray-200 p-4 dark:border-white/10 sm:p-6">
      <p class="text-sm text-gray-500">{{ t('personalCenter.apiPanel.noCredential') }}</p>
      <button type="button" :disabled="submitting" class="mt-4 h-11 w-full rounded-full px-6 text-sm font-black text-white disabled:opacity-60 sm:w-auto" style="background-color: var(--ui-accent);" @click="handleApply">
        {{ submitting ? t('personalCenter.apiPanel.applying') : t('personalCenter.apiPanel.apply') }}
      </button>
    </div>

    <div v-else-if="credential.status === 'pending_review'" class="mt-5 rounded-2xl p-4 text-sm leading-6 sm:p-5" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
      <h3 class="font-black">{{ t('personalCenter.apiPanel.pendingTitle') }}</h3>
      <p class="mt-1 break-words">{{ t('personalCenter.apiPanel.pendingDesc') }}</p>
    </div>

    <div v-else-if="credential.status === 'rejected'" class="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-600 dark:bg-red-500/10 sm:p-5">
      <h3 class="font-black">{{ t('personalCenter.apiPanel.rejectedTitle') }}</h3>
      <p v-if="credential.reject_reason" class="mt-1 break-words">{{ t('personalCenter.apiPanel.rejectReason', { reason: credential.reject_reason }) }}</p>
      <button type="button" :disabled="submitting" class="mt-4 h-10 w-full rounded-full px-5 text-sm font-black text-white disabled:opacity-60 sm:w-auto" style="background-color: var(--ui-accent);" @click="handleApply">
        {{ submitting ? t('personalCenter.apiPanel.applying') : t('personalCenter.apiPanel.reapply') }}
      </button>
    </div>

    <div v-else class="mt-5 space-y-4">
      <div class="grid gap-3 lg:grid-cols-2">
        <KeyValueCard label="API Key" :value="credential.api_key || '-'" @copy="copyToClipboard(credential.api_key || '')" />
        <KeyValueCard label="API Secret" :value="maskedSecret" :action="t('personalCenter.apiPanel.regenerate')" @copy="copyToClipboard(maskedSecret)" @action="showConfirm = true" />
      </div>

      <div v-if="newSecret" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
        <div class="font-black">{{ t('personalCenter.apiPanel.newSecretTitle') }}</div>
        <p class="mt-1 break-words text-xs leading-5">{{ t('personalCenter.apiPanel.newSecretWarning') }}</p>
        <div class="mt-3 grid min-w-0 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <code class="block min-w-0 break-all rounded-lg bg-white px-3 py-2 text-xs leading-5 dark:bg-neutral-900 sm:text-sm">{{ newSecret }}</code>
          <button type="button" class="h-9 w-full rounded-full border border-emerald-300 px-3 text-xs font-bold sm:w-auto" @click="copyToClipboard(newSecret)">
            {{ t('personalCenter.apiPanel.copySecret') }}
          </button>
        </div>
      </div>

      <div class="flex min-w-0 flex-col items-start justify-between gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-white/5 sm:flex-row sm:items-center">
        <div class="min-w-0">
          <div class="text-sm font-black text-gray-950 dark:text-white">{{ t('personalCenter.apiPanel.statusLabel') }}</div>
          <div class="mt-1 break-words text-xs leading-5 text-gray-500">
            {{ credential.is_active ? t('personalCenter.apiPanel.statusEnabled') : t('personalCenter.apiPanel.statusDisabled') }}
          </div>
        </div>
        <button
          type="button"
          :disabled="submitting"
          class="relative inline-flex h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60"
          :class="credential.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/20'"
          @click="handleToggleStatus"
        >
          <span class="mt-1 h-5 w-5 rounded-full bg-white shadow transition" :class="credential.is_active ? 'ml-6' : 'ml-1'"></span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" @click.self="showConfirm = false">
        <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-950">
          <h3 class="text-lg font-black">{{ t('personalCenter.apiPanel.regenerateTitle') }}</h3>
          <p class="mt-2 text-sm text-gray-500">{{ t('personalCenter.apiPanel.regenerateDesc') }}</p>
          <div class="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button type="button" class="h-10 rounded-full border border-gray-200 px-4 text-sm font-bold dark:border-white/10" @click="showConfirm = false">
              {{ t('personalCenter.apiPanel.cancel') }}
            </button>
            <button type="button" :disabled="submitting" class="h-10 rounded-full bg-red-600 px-4 text-sm font-black text-white disabled:opacity-60" @click="confirmRegenerate">
              {{ submitting ? t('personalCenter.apiPanel.regenerating') : t('personalCenter.apiPanel.regenerateConfirm') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiCredentialAPI } from '../../../../api'
import { mallAlertClass, type MallAlert } from './shared'

interface CredentialData {
  id: number
  api_key: string
  api_secret_masked?: string
  api_secret_tail?: string
  status: string
  is_active: boolean
  reject_reason?: string
}

const { t } = useI18n()
const loading = ref(false)
const submitting = ref(false)
const credential = ref<CredentialData | null>(null)
const panelAlert = ref<MallAlert | null>(null)
const newSecret = ref('')
const showConfirm = ref(false)
const secretViewedKey = 'api_secret_viewed'

const maskedSecret = computed(() => {
  if (credential.value?.api_secret_masked) return credential.value.api_secret_masked
  if (credential.value?.api_secret_tail) return `********${credential.value.api_secret_tail}`
  return '********'
})

const loadCredential = async () => {
  loading.value = true
  panelAlert.value = null
  try {
    const response = await apiCredentialAPI.getMy()
    const data = response.data.data
    credential.value = data && data.status !== 'none' ? data : null
  } catch {
    credential.value = null
  } finally {
    loading.value = false
  }
}

const markSecretViewed = () => {
  if (!credential.value?.id) return
  localStorage.setItem(secretViewedKey, String(credential.value.id))
}

const handleApply = async () => {
  submitting.value = true
  panelAlert.value = null
  try {
    await apiCredentialAPI.apply()
    panelAlert.value = { level: 'success', message: t('personalCenter.apiPanel.applySuccess') }
    await loadCredential()
  } catch (err: any) {
    panelAlert.value = { level: 'error', message: err?.message || t('personalCenter.apiPanel.applyFailed') }
  } finally {
    submitting.value = false
  }
}

const confirmRegenerate = async () => {
  submitting.value = true
  panelAlert.value = null
  try {
    const response = await apiCredentialAPI.regenerate()
    newSecret.value = String(response.data.data?.api_secret || '')
    markSecretViewed()
    await loadCredential()
    panelAlert.value = { level: 'success', message: t('personalCenter.apiPanel.regenerateSuccess') }
  } catch (err: any) {
    panelAlert.value = { level: 'error', message: err?.message || t('personalCenter.apiPanel.regenerateFailed') }
  } finally {
    submitting.value = false
    showConfirm.value = false
  }
}

const handleToggleStatus = async () => {
  if (!credential.value) return
  submitting.value = true
  panelAlert.value = null
  const isActive = !credential.value.is_active
  try {
    await apiCredentialAPI.updateStatus({ is_active: isActive })
    credential.value.is_active = isActive
    panelAlert.value = { level: 'success', message: isActive ? t('personalCenter.apiPanel.enabled') : t('personalCenter.apiPanel.disabled') }
  } catch (err: any) {
    panelAlert.value = { level: 'error', message: err?.message || t('personalCenter.apiPanel.toggleFailed') }
  } finally {
    submitting.value = false
  }
}

const copyToClipboard = async (text: string) => {
  if (!text || text === '********') return
  try {
    await navigator.clipboard.writeText(text)
    panelAlert.value = { level: 'success', message: t('personalCenter.apiPanel.copied') }
  } catch {
    panelAlert.value = { level: 'error', message: t('personalCenter.apiPanel.copyFailed') }
  }
}

const KeyValueCard = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    action: { type: String, default: '' },
  },
  emits: ['copy', 'action'],
  setup(props, { emit }) {
    return () => h('div', { class: 'min-w-0 rounded-2xl bg-gray-50 p-3 dark:bg-white/5 sm:p-4' }, [
      h('div', { class: 'text-xs font-bold text-gray-500' }, props.label),
      h('div', { class: 'mt-2 grid min-w-0 gap-2 sm:flex sm:flex-wrap sm:items-center' }, [
        h('code', { class: 'block max-w-full min-w-0 break-all rounded-lg bg-white px-3 py-2 text-xs font-bold leading-5 dark:bg-neutral-900 sm:text-sm' }, props.value),
        h('button', { type: 'button', class: 'h-9 w-full rounded-full border border-gray-200 px-3 text-xs font-bold hover:text-[#ff5000] dark:border-white/10 sm:h-auto sm:w-auto sm:py-2', onClick: () => emit('copy') }, t('personalCenter.apiPanel.copy')),
        props.action ? h('button', { type: 'button', class: 'h-9 w-full rounded-full bg-[#ff5000] px-3 text-xs font-black text-white sm:h-auto sm:w-auto sm:py-2', onClick: () => emit('action') }, props.action) : null,
      ]),
    ])
  },
})

onMounted(loadCredential)
</script>
