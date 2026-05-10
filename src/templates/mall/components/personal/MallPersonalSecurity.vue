<template>
  <div class="flex min-h-0 flex-col gap-2 overflow-visible lg:h-full lg:gap-3 lg:overflow-hidden">
    <section class="shrink-0 border-y border-gray-100 bg-white p-2.5 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-5 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('personalCenter.security.title') }}</h2>
          <p class="mt-0.5 break-words text-xs leading-5 text-gray-500 dark:text-gray-400">
            {{ requiresOldEmailCode ? t('personalCenter.security.subtitle') : t('personalCenter.security.subtitleBindOnly') }}
          </p>
        </div>
      </div>

      <div v-if="securityAlert" class="mt-2 rounded-xl border px-3 py-2 text-sm sm:mt-3 sm:px-4" :class="mallAlertClass(securityAlert.level)">
        {{ securityAlert.message }}
      </div>

      <div class="mt-2 grid min-w-0 items-stretch gap-2 md:grid-cols-2 sm:mt-3 sm:gap-3 xl:grid-cols-4">
        <div class="flex min-w-0 flex-col rounded-xl bg-gray-50 p-2.5 dark:bg-white/5 sm:rounded-2xl sm:p-3">
          <div class="flex min-h-0 flex-col gap-2 border-b border-gray-200 pb-2 dark:border-white/10 sm:min-h-12 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:pb-3">
            <div class="min-w-0">
              <h3 class="break-words font-black text-gray-950 dark:text-white">{{ t('personalCenter.security.telegramTitle') }}</h3>
              <p class="mt-0.5 break-words text-xs leading-5 text-gray-500">{{ t('personalCenter.security.telegramSubtitle') }}</p>
            </div>
            <span class="w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold" :class="telegramBound ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300'">
              {{ telegramBound ? t('personalCenter.security.telegramBound') : t('personalCenter.security.telegramUnbound') }}
            </span>
          </div>
          <div v-if="!telegramEnabled" class="mt-3 break-words rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm leading-6 text-gray-500 dark:border-white/10">
            {{ t('personalCenter.security.telegramDisabledTip') }}
          </div>
          <div v-else-if="telegramBound" class="mt-3 flex flex-wrap items-center gap-3">
            <img v-if="userProfileStore.telegramBinding?.avatar_url" :src="userProfileStore.telegramBinding.avatar_url" class="h-10 w-10 rounded-full object-cover" alt="" />
            <div class="min-w-0 flex-1">
              <div class="truncate font-black">{{ telegramDisplayName }}</div>
              <div class="mt-1 text-xs text-gray-500">{{ t('personalCenter.security.telegramBindID', { id: userProfileStore.telegramBinding?.provider_user_id || '-' }) }}</div>
            </div>
            <button
              v-if="canUnbindTelegram"
              type="button"
              :disabled="userProfileStore.unbindingTelegram"
              class="h-9 w-full rounded-full border border-red-200 px-4 text-sm font-bold text-red-600 disabled:opacity-60 dark:border-red-500/20 sm:w-auto"
              @click="handleUnbindTelegram"
            >
              {{ userProfileStore.unbindingTelegram ? t('personalCenter.security.telegramUnbinding') : t('personalCenter.security.telegramUnbind') }}
            </button>
          </div>
          <div v-else class="mt-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
            <button
              v-if="showTelegramMiniAppEntry"
              type="button"
              class="h-9 w-full rounded-full border border-gray-200 px-4 text-sm font-bold hover:text-[#ff5000] dark:border-white/10 sm:w-auto"
              @click="openTelegramMiniAppEntry"
            >
              {{ t('personalCenter.security.telegramMiniAppEntryAction') }}
            </button>
            <button
              v-if="showMiniAppBindAction"
              type="button"
              :disabled="userProfileStore.bindingTelegram"
              class="h-9 w-full rounded-full bg-[#ff5000] px-4 text-sm font-black text-white disabled:opacity-60 sm:w-auto"
              @click="handleTelegramMiniAppBind"
            >
              {{ userProfileStore.bindingTelegram ? t('personalCenter.security.telegramMiniAppBinding') : t('personalCenter.security.telegramMiniAppBindAction') }}
            </button>
            <div v-if="showTelegramWidget" ref="telegramWidgetRef" class="min-h-[44px] max-w-full overflow-hidden"></div>
          </div>
        </div>

        <div class="flex min-w-0 flex-col rounded-xl bg-gray-50 p-2.5 dark:bg-white/5 sm:rounded-2xl sm:p-3">
          <div class="min-h-0 border-b border-gray-200 pb-2 dark:border-white/10 sm:min-h-12 sm:pb-3">
            <h3 class="break-words font-black text-gray-950 dark:text-white">{{ t('personalCenter.security.twofa.title') }}</h3>
            <p class="mt-0.5 break-words text-xs leading-5 text-gray-500">{{ t('personalCenter.security.twofa.subtitle') }}</p>
          </div>
          <div class="mt-3 flex flex-1">
            <TwoFactorMallCard />
          </div>
        </div>

        <div class="flex min-w-0 flex-col rounded-xl bg-gray-50 p-2.5 dark:bg-white/5 sm:rounded-2xl sm:p-3">
          <div class="min-h-0 border-b border-gray-200 pb-2 dark:border-white/10 sm:min-h-12 sm:pb-3">
            <h3 class="break-words font-black text-gray-950 dark:text-white">{{ requiresOldEmailCode ? t('personalCenter.security.submit') : t('personalCenter.security.bindSubmit') }}</h3>
            <p class="mt-0.5 break-words text-xs leading-5 text-gray-500">{{ requiresOldEmailCode ? t('personalCenter.security.subtitle') : t('personalCenter.security.subtitleBindOnly') }}</p>
          </div>
          <div class="mt-2 flex flex-1 flex-col sm:mt-3">
            <div class="space-y-2">
              <label class="block">
                <span class="mb-1 block text-xs font-bold text-gray-500">{{ t('personalCenter.security.currentEmailLabel') }}</span>
                <input :value="currentEmailDisplay" disabled class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 dark:border-white/10 dark:bg-neutral-900 sm:h-10" />
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-bold text-gray-500">{{ t('personalCenter.security.newEmailLabel') }}</span>
                <input v-model.trim="securityForm.newEmail" class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900 sm:h-10" :placeholder="t('personalCenter.security.newEmailPlaceholder')" />
              </label>
              <div v-if="requiresOldEmailCode" class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input v-model.trim="securityForm.oldCode" class="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900 sm:h-10" :placeholder="t('personalCenter.security.oldCodeLabel')" />
                <button type="button" :disabled="userProfileStore.sendingCode || oldCodeCooldown > 0" class="h-9 rounded-full border border-gray-200 px-4 text-xs font-bold disabled:opacity-50 dark:border-white/10 sm:h-10" @click="handleSendOldCode">
                  {{ oldCodeCooldown > 0 ? t('personalCenter.security.countdown', { seconds: oldCodeCooldown }) : t('personalCenter.security.sendOldCode') }}
                </button>
              </div>
              <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input v-model.trim="securityForm.newCode" class="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900 sm:h-10" :placeholder="t('personalCenter.security.newCodeLabel')" />
                <button type="button" :disabled="userProfileStore.sendingCode || newCodeCooldown > 0" class="h-9 rounded-full border border-gray-200 px-4 text-xs font-bold disabled:opacity-50 dark:border-white/10 sm:h-10" @click="handleSendNewCode">
                  {{ newCodeCooldown > 0 ? t('personalCenter.security.countdown', { seconds: newCodeCooldown }) : t('personalCenter.security.sendNewCode') }}
                </button>
              </div>
            </div>
            <div class="mt-auto pt-3">
              <button type="button" :disabled="userProfileStore.changingEmail" class="h-10 w-full rounded-full bg-[#ff5000] px-5 text-sm font-black text-white disabled:opacity-60" @click="handleChangeEmail">
                {{ userProfileStore.changingEmail ? t('personalCenter.security.submitting') : (requiresOldEmailCode ? t('personalCenter.security.submit') : t('personalCenter.security.bindSubmit')) }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="canManagePassword" class="flex min-w-0 flex-col rounded-xl bg-gray-50 p-2.5 dark:bg-white/5 sm:rounded-2xl sm:p-3">
          <div class="min-h-0 border-b border-gray-200 pb-2 dark:border-white/10 sm:min-h-12 sm:pb-3">
            <h3 class="break-words font-black text-gray-950 dark:text-white">{{ requiresOldPassword ? t('personalCenter.security.passwordTitle') : t('personalCenter.security.setPasswordTitle') }}</h3>
            <p class="mt-0.5 break-words text-xs leading-5 text-gray-500">{{ t('personalCenter.security.newPasswordLabel') }}</p>
          </div>
          <div class="mt-2 flex flex-1 flex-col sm:mt-3">
            <div class="space-y-2">
              <input v-if="requiresOldPassword" v-model="passwordForm.oldPassword" type="password" class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900 sm:h-10" :placeholder="t('personalCenter.security.currentPasswordLabel')" />
              <input v-model="passwordForm.newPassword" type="password" class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900 sm:h-10" :placeholder="t('personalCenter.security.newPasswordLabel')" />
              <input v-model="passwordForm.confirmPassword" type="password" class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900 sm:h-10" :placeholder="t('personalCenter.security.confirmPasswordLabel')" />
            </div>
            <div class="mt-auto pt-3">
              <button type="button" :disabled="userProfileStore.changingPassword" class="h-10 w-full rounded-full bg-[#ff5000] px-5 text-sm font-black text-white disabled:opacity-60" @click="handleChangePassword">
                {{ userProfileStore.changingPassword ? t('personalCenter.security.changePasswordSubmitting') : (requiresOldPassword ? t('personalCenter.security.changePassword') : t('personalCenter.security.setPassword')) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="flex min-h-0 flex-1 flex-col border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="shrink-0 border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-2.5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-base font-black text-gray-950 dark:text-white">{{ t('personalCenter.security.loginLogsTitle') }}</h3>
            <p class="mt-0.5 text-xs text-gray-500">{{ t('personalCenter.security.loginLogsTip') }}</p>
          </div>
          <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {{ t('personalCenter.security.loginLogsTotal', { total: loginLogsPagination.total }) }}
            </span>
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {{ t('orders.pageInfo', { page: loginLogsPagination.page, total: safeLoginLogTotalPages }) }}
            </span>
            <button
              type="button"
              class="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-semibold transition hover:border-orange-400 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
              :disabled="userProfileStore.loadingLoginLogs || loginLogsPagination.page <= 1"
              @click="changeLoginLogPage(loginLogsPagination.page - 1)"
            >
              {{ t('pagination.previous') }}
            </button>
            <button
              type="button"
              class="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-semibold transition hover:border-orange-400 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
              :disabled="userProfileStore.loadingLoginLogs || loginLogsPagination.page >= safeLoginLogTotalPages"
              @click="changeLoginLogPage(loginLogsPagination.page + 1)"
            >
              {{ t('pagination.next') }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="userProfileStore.loadingLoginLogs" class="min-h-0 flex-1 space-y-2 p-4">
        <div v-for="idx in loginLogPageSize" :key="idx" class="h-11 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"></div>
      </div>
      <div v-else-if="loginLogs.length === 0" class="flex min-h-0 flex-1 items-center justify-center px-5 py-8 text-center text-sm text-gray-500">
        {{ t('personalCenter.security.loginLogsEmpty') }}
      </div>
      <div v-else class="min-h-0 flex-1 divide-y divide-gray-100 dark:divide-white/10">
        <div v-for="log in loginLogs" :key="log.id" class="grid min-h-10 gap-1.5 px-3 py-2 text-sm sm:grid-cols-[140px_minmax(0,1fr)_160px] sm:items-center sm:px-5">
          <span class="rounded-full px-3 py-1 text-xs font-bold" :class="log.status === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'">
            {{ loginStatusLabel(log.status) }}
          </span>
          <div class="min-w-0 text-gray-500">
              <div class="break-all">{{ log.client_ip || '-' }}</div>
              <div class="break-all text-xs leading-5">{{ log.fail_reason ? loginReasonLabel(log.fail_reason) : log.user_agent || '-' }}</div>
          </div>
          <div class="text-xs text-gray-500 sm:text-right">{{ formatMallDate(log.created_at) }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import type { TelegramAuthPayload } from '../../../../api'
import { userTotpAPI } from '../../../../api/auth'
import { useAppStore } from '../../../../stores/app'
import { useTelegramMiniAppStore } from '../../../../stores/telegramMiniApp'
import { useUserAuthStore } from '../../../../stores/userAuth'
import { useUserProfileStore } from '../../../../stores/userProfile'
import { buildTelegramMiniAppEntryLink, openTelegramCompatibleLink } from '../../../../utils/telegramMiniApp'
import { formatMallDate, mallAlertClass, type MallAlert } from './shared'

const { t } = useI18n()
const appStore = useAppStore()
const telegramMiniAppStore = useTelegramMiniAppStore()
const userAuthStore = useUserAuthStore()
const userProfileStore = useUserProfileStore()

const securityForm = reactive({ newEmail: '', oldCode: '', newCode: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const securityAlert = ref<MallAlert | null>(null)
const oldCodeCooldown = ref(0)
const newCodeCooldown = ref(0)
const telegramWidgetRef = ref<HTMLElement | null>(null)
let cooldownTimer: number | null = null
const telegramCallbackName = '__dujiaoMallSecurityTelegramBind'

const telegramConfig = computed(() => appStore.config?.telegram_auth || null)
const telegramBotUsername = computed(() => String(telegramConfig.value?.bot_username || '').trim())
const telegramMiniAppURL = computed(() => String(telegramConfig.value?.mini_app_url || '').trim())
const telegramEnabled = computed(() => Boolean(telegramConfig.value?.enabled) && telegramBotUsername.value !== '')
const telegramBound = computed(() => Boolean(userProfileStore.telegramBinding?.bound))
const isTelegramMiniApp = computed(() => telegramMiniAppStore.isMiniApp && telegramMiniAppStore.isReady)
const miniAppInitData = computed(() => String(telegramMiniAppStore.initData || '').trim())
const showMiniAppBindAction = computed(() => telegramEnabled.value && !telegramBound.value && isTelegramMiniApp.value)
const showTelegramWidget = computed(() => telegramEnabled.value && !telegramBound.value && !isTelegramMiniApp.value)
const telegramMiniAppEntryLink = computed(() => buildTelegramMiniAppEntryLink(telegramBotUsername.value, telegramMiniAppURL.value))
const showTelegramMiniAppEntry = computed(() => !isTelegramMiniApp.value && telegramMiniAppEntryLink.value !== '')
const emailChangeMode = computed(() => userProfileStore.profile?.email_change_mode || 'change_with_old_and_new')
const requiresOldEmailCode = computed(() => emailChangeMode.value !== 'bind_only')
const canManagePassword = computed(() => requiresOldEmailCode.value)
const passwordChangeMode = computed(() => userProfileStore.profile?.password_change_mode || 'change_with_old')
const requiresOldPassword = computed(() => passwordChangeMode.value !== 'set_without_old')
const canUnbindTelegram = computed(() => requiresOldEmailCode.value)
const currentEmailDisplay = computed(() => requiresOldEmailCode.value ? (userProfileStore.profile?.email || '') : t('personalCenter.security.bindOnlyEmailDisplay'))
const telegramDisplayName = computed(() => userProfileStore.telegramBinding?.username ? `@${userProfileStore.telegramBinding.username}` : t('personalCenter.security.telegramDisplayFallback'))
const loginLogPageSize = 6
const loginLogs = computed(() => userProfileStore.recentLoginLogs)
const loginLogsPagination = computed(() => userProfileStore.loginLogsPagination)
const safeLoginLogTotalPages = computed(() => Math.max(1, Number(loginLogsPagination.value.total_page || 1)))

const loginStatusLabel = (status?: string) => {
  const key = `personalCenter.security.loginLogsStatusMap.${status || ''}`
  const label = t(key)
  return label === key ? status || '-' : label
}
const loginReasonLabel = (reason?: string) => {
  const key = `personalCenter.security.loginLogsReasonMap.${reason || ''}`
  const label = t(key)
  return label === key ? reason || '-' : label
}

const startCooldown = (kind: 'old' | 'new') => {
  if (kind === 'old') oldCodeCooldown.value = 60
  if (kind === 'new') newCodeCooldown.value = 60
  if (cooldownTimer !== null) return
  cooldownTimer = window.setInterval(() => {
    oldCodeCooldown.value = Math.max(oldCodeCooldown.value - 1, 0)
    newCodeCooldown.value = Math.max(newCodeCooldown.value - 1, 0)
    if (oldCodeCooldown.value === 0 && newCodeCooldown.value === 0 && cooldownTimer !== null) {
      window.clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

const handleSendOldCode = async () => {
  securityAlert.value = null
  const ok = await userProfileStore.sendChangeEmailCode({ kind: 'old' })
  if (!ok) {
    securityAlert.value = { level: 'error', message: userProfileStore.securityError || t('personalCenter.security.sendCodeFailed') }
    return
  }
  startCooldown('old')
  securityAlert.value = { level: 'success', message: t('personalCenter.security.sendOldCodeSuccess') }
}
const handleSendNewCode = async () => {
  securityAlert.value = null
  if (!securityForm.newEmail.trim()) {
    securityAlert.value = { level: 'warning', message: t('personalCenter.security.newEmailRequired') }
    return
  }
  const ok = await userProfileStore.sendChangeEmailCode({ kind: 'new', new_email: securityForm.newEmail.trim() })
  if (!ok) {
    securityAlert.value = { level: 'error', message: userProfileStore.securityError || t('personalCenter.security.sendCodeFailed') }
    return
  }
  startCooldown('new')
  securityAlert.value = { level: 'success', message: t('personalCenter.security.sendNewCodeSuccess') }
}
const handleChangeEmail = async () => {
  securityAlert.value = null
  const oldCode = securityForm.oldCode.trim()
  const payload = {
    new_email: securityForm.newEmail.trim(),
    new_code: securityForm.newCode.trim(),
    ...(requiresOldEmailCode.value ? { old_code: oldCode } : {}),
  }
  if (!payload.new_email || !payload.new_code || (requiresOldEmailCode.value && !oldCode)) {
    securityAlert.value = { level: 'warning', message: requiresOldEmailCode.value ? t('personalCenter.security.changeEmailRequired') : t('personalCenter.security.bindEmailRequired') }
    return
  }
  const ok = await userProfileStore.changeEmail(payload)
  if (!ok) {
    securityAlert.value = { level: 'error', message: userProfileStore.securityError || t('personalCenter.security.changeEmailFailed') }
    return
  }
  securityForm.newEmail = ''
  securityForm.oldCode = ''
  securityForm.newCode = ''
  securityAlert.value = { level: 'success', message: requiresOldEmailCode.value ? t('personalCenter.security.changeEmailSuccess') : t('personalCenter.security.bindEmailSuccess') }
}
const handleChangePassword = async () => {
  securityAlert.value = null
  const oldPassword = passwordForm.oldPassword.trim()
  const newPassword = passwordForm.newPassword.trim()
  const confirmPassword = passwordForm.confirmPassword.trim()
  if (!newPassword || !confirmPassword || (requiresOldPassword.value && !oldPassword)) {
    securityAlert.value = { level: 'warning', message: requiresOldPassword.value ? t('personalCenter.security.changePasswordRequired') : t('personalCenter.security.setPasswordRequired') }
    return
  }
  if (newPassword !== confirmPassword) {
    securityAlert.value = { level: 'warning', message: t('personalCenter.security.passwordMismatch') }
    return
  }
  const ok = await userProfileStore.changePassword({
    ...(requiresOldPassword.value ? { old_password: oldPassword } : {}),
    new_password: newPassword,
  })
  if (!ok) {
    securityAlert.value = { level: 'error', message: userProfileStore.securityError || t('personalCenter.security.changePasswordFailed') }
    return
  }
  securityAlert.value = { level: 'success', message: requiresOldPassword.value ? t('personalCenter.security.changePasswordSuccess') : t('personalCenter.security.setPasswordSuccess') }
  userAuthStore.logout('/')
}

const buildTelegramPayload = (raw: any): TelegramAuthPayload | null => {
  const id = Number(raw?.id)
  const authDate = Number(raw?.auth_date)
  const hash = String(raw?.hash || '').trim()
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(authDate) || authDate <= 0 || !hash) return null
  return {
    id,
    first_name: String(raw?.first_name || '').trim(),
    last_name: String(raw?.last_name || '').trim(),
    username: String(raw?.username || '').trim(),
    photo_url: String(raw?.photo_url || '').trim(),
    auth_date: authDate,
    hash,
  }
}
const clearTelegramWidget = () => {
  if (telegramWidgetRef.value) telegramWidgetRef.value.innerHTML = ''
}
const renderTelegramWidget = () => {
  if (!showTelegramWidget.value || !telegramWidgetRef.value) {
    clearTelegramWidget()
    return
  }
  clearTelegramWidget()
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', telegramBotUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-userpic', 'false')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', `${telegramCallbackName}(user)`)
  script.onerror = () => {
    securityAlert.value = { level: 'error', message: t('personalCenter.security.telegramWidgetLoadFailed') }
  }
  telegramWidgetRef.value.appendChild(script)
}
const handleTelegramBind = async (raw: any) => {
  securityAlert.value = null
  const payload = buildTelegramPayload(raw)
  if (!payload) {
    securityAlert.value = { level: 'warning', message: t('personalCenter.security.telegramInvalidPayload') }
    return
  }
  const ok = await userProfileStore.bindTelegram(payload)
  securityAlert.value = ok
    ? { level: 'success', message: t('personalCenter.security.telegramBindSuccess') }
    : { level: 'error', message: userProfileStore.securityError || t('personalCenter.security.telegramBindFailed') }
  renderTelegramWidget()
}
const handleTelegramMiniAppBind = async () => {
  securityAlert.value = null
  if (!miniAppInitData.value) {
    securityAlert.value = { level: 'warning', message: t('personalCenter.security.telegramMiniAppInitDataMissing') }
    return
  }
  const ok = await userProfileStore.bindTelegramMiniApp(miniAppInitData.value)
  securityAlert.value = ok
    ? { level: 'success', message: t('personalCenter.security.telegramBindSuccess') }
    : { level: 'error', message: userProfileStore.securityError || t('personalCenter.security.telegramBindFailed') }
}
const handleUnbindTelegram = async () => {
  securityAlert.value = null
  const ok = await userProfileStore.unbindTelegram()
  securityAlert.value = ok
    ? { level: 'success', message: t('personalCenter.security.telegramUnbindSuccess') }
    : { level: 'error', message: userProfileStore.securityError || t('personalCenter.security.telegramUnbindFailed') }
  renderTelegramWidget()
}
const openTelegramMiniAppEntry = () => {
  if (telegramMiniAppEntryLink.value) openTelegramCompatibleLink(telegramMiniAppEntryLink.value)
}
const refreshSecurity = async () => {
  await Promise.all([
    appStore.loadConfig(),
    userProfileStore.loadRecentLoginLogs({ page: 1, pageSize: loginLogPageSize }),
    userProfileStore.loadTelegramBinding(),
  ])
  renderTelegramWidget()
}
const changeLoginLogPage = async (page: number) => {
  const nextPage = Math.min(Math.max(1, page), safeLoginLogTotalPages.value)
  if (nextPage === loginLogsPagination.value.page || userProfileStore.loadingLoginLogs) return
  await userProfileStore.loadRecentLoginLogs({ page: nextPage, pageSize: loginLogPageSize })
}

const TwoFactorMallCard = defineComponent({
  setup() {
    const status = ref<any>(null)
    const loading = ref(false)
    const alert = ref<MallAlert | null>(null)
    const setupResult = ref<any>(null)
    const qr = ref('')
    const code = ref('')
    const disableCode = ref('')
    const recoveryCodes = ref<string[]>([])
    const loadStatus = async () => {
      try {
        const response = await userTotpAPI.status()
        status.value = response.data.data
      } catch (err: any) {
        alert.value = { level: 'error', message: err?.message || t('personalCenter.security.twofa.loadFailed') }
      }
    }
    const startSetup = async () => {
      loading.value = true
      alert.value = null
      try {
        const response = await userTotpAPI.setup()
        setupResult.value = response.data.data
        qr.value = await QRCode.toDataURL(setupResult.value.otpauth_url, { width: 220, margin: 1 })
      } catch (err: any) {
        alert.value = { level: 'error', message: err?.message || t('personalCenter.security.twofa.setupFailed') }
      } finally {
        loading.value = false
      }
    }
    const enable = async () => {
      if (!code.value.trim()) {
        alert.value = { level: 'warning', message: t('personalCenter.security.twofa.codeRequired') }
        return
      }
      loading.value = true
      try {
        const response = await userTotpAPI.enable({ code: code.value.trim() })
        recoveryCodes.value = response.data.data?.recovery_codes || []
        setupResult.value = null
        code.value = ''
        await loadStatus()
      } catch (err: any) {
        alert.value = { level: 'error', message: err?.message || t('personalCenter.security.twofa.enableFailed') }
      } finally {
        loading.value = false
      }
    }
    const disable = async () => {
      if (!disableCode.value.trim()) {
        alert.value = { level: 'warning', message: t('personalCenter.security.twofa.codeRequired') }
        return
      }
      loading.value = true
      try {
        await userTotpAPI.disable({ code: disableCode.value.trim() })
        disableCode.value = ''
        await loadStatus()
      } catch (err: any) {
        alert.value = { level: 'error', message: err?.message || t('personalCenter.security.twofa.disableFailed') }
      } finally {
        loading.value = false
      }
    }
    onMounted(loadStatus)
    return () => h('div', { class: 'flex min-w-0 flex-col space-y-2 lg:h-full' }, [
      h('div', { class: 'flex justify-end' }, [
        h('span', { class: `rounded-full px-3 py-1 text-xs font-bold ${status.value?.enabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'}` }, status.value?.enabled ? t('personalCenter.security.twofa.statusEnabled') : t('personalCenter.security.twofa.statusDisabled')),
      ]),
      alert.value ? h('div', { class: `rounded-xl border px-4 py-2 text-sm ${mallAlertClass(alert.value.level)}` }, alert.value.message) : null,
      status.value?.enabled
        ? h('div', { class: 'mt-auto space-y-2 pt-3' }, [
          h('div', { class: 'rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500 dark:bg-white/5' }, [
            h('div', { class: 'break-words' }, t('personalCenter.security.twofa.enabledAt', { date: formatMallDate(status.value.enabled_at) })),
            h('div', { class: 'mt-1 break-words' }, t('personalCenter.security.twofa.recoveryRemaining', { remaining: status.value.recovery_codes_remaining, total: status.value.recovery_codes_total })),
          ]),
          h('input', { value: disableCode.value, onInput: (event: any) => { disableCode.value = event.target.value }, class: 'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900', placeholder: t('personalCenter.security.twofa.codePlaceholder') }),
          h('button', { type: 'button', disabled: loading.value, class: 'h-10 w-full rounded-full border border-red-200 px-5 text-sm font-bold text-red-600 disabled:opacity-60 dark:border-red-500/20 sm:w-auto', onClick: disable }, loading.value ? t('personalCenter.security.twofa.disableSubmitting') : t('personalCenter.security.twofa.disableSubmit')),
        ])
        : h('div', { class: 'mt-auto space-y-2 pt-3' }, [
          !setupResult.value ? h('button', { type: 'button', disabled: loading.value, class: 'h-10 w-full rounded-full bg-[#ff5000] px-5 text-sm font-black text-white disabled:opacity-60 sm:w-auto', onClick: startSetup }, loading.value ? t('personalCenter.security.twofa.startingSetup') : t('personalCenter.security.twofa.startSetup')) : null,
          setupResult.value ? h('div', { class: 'space-y-2' }, [
            qr.value ? h('img', { src: qr.value, class: 'mx-auto h-36 w-36 rounded-xl bg-white p-2 ring-1 ring-gray-200 sm:mx-0' }) : null,
            h('code', { class: 'block break-all rounded-xl bg-gray-50 p-2 text-xs dark:bg-white/5' }, setupResult.value.secret),
            h('input', { value: code.value, onInput: (event: any) => { code.value = event.target.value }, class: 'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-center text-sm tracking-[0.3em] outline-none focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900', placeholder: t('personalCenter.security.twofa.codePlaceholder') }),
            h('button', { type: 'button', disabled: loading.value, class: 'h-10 w-full rounded-full bg-[#ff5000] px-5 text-sm font-black text-white disabled:opacity-60 sm:w-auto', onClick: enable }, loading.value ? t('personalCenter.security.twofa.enableSubmitting') : t('personalCenter.security.twofa.enableSubmit')),
          ]) : null,
        ]),
      recoveryCodes.value.length > 0 ? h('div', { class: 'mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' }, [
        h('div', { class: 'font-black' }, t('personalCenter.security.twofa.recoveryTitle')),
        h('div', { class: 'mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2' }, recoveryCodes.value.map((item) => h('code', { class: 'rounded-lg bg-white px-2 py-1 text-center dark:bg-neutral-900' }, item))),
      ]) : null,
    ])
  },
})

onMounted(async () => {
  await refreshSecurity()
  ;(window as Window & Record<string, any>)[telegramCallbackName] = handleTelegramBind
  renderTelegramWidget()
})
onUnmounted(() => {
  delete (window as Window & Record<string, any>)[telegramCallbackName]
  clearTelegramWidget()
  if (cooldownTimer !== null) window.clearInterval(cooldownTimer)
})
watch([showTelegramWidget, telegramBotUsername], renderTelegramWidget)
</script>
