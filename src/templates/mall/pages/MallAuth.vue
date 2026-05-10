<template>
  <div :class="embedded ? 'w-full' : 'mx-auto grid min-h-[calc(100vh-220px)] max-w-[1180px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:px-8'">
    <section v-if="!embedded" class="hidden rounded-lg bg-white p-8 shadow-sm ring-1 ring-gray-100 dark:bg-neutral-950 dark:ring-white/10 lg:block">
      <router-link to="/" class="inline-flex items-center gap-3">
        <img v-if="siteIcon" :src="siteIcon" alt="" class="h-12 w-12 rounded-lg object-cover" />
        <span v-else class="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600 text-xl font-black text-white">
          {{ siteInitial }}
        </span>
        <span class="text-3xl font-black text-orange-600">{{ siteName }}</span>
      </router-link>
      <div class="mt-12 max-w-lg">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-600">{{ currentTitle }}</p>
        <h1 class="mt-4 text-4xl font-black leading-tight text-gray-950 dark:text-white">
          {{ currentSubtitle }}
        </h1>
        <p class="mt-5 text-base leading-7 text-gray-500 dark:text-gray-400">
          {{ t('auth.login.subtitle') }}
        </p>
      </div>
    </section>

    <section :class="embedded ? 'bg-white p-5 dark:bg-neutral-950 sm:p-6' : 'rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-neutral-950 dark:ring-white/10 sm:p-8'">
      <div class="mb-6 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">{{ siteName }}</p>
          <h1 class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ currentTitle }}</h1>
        </div>
        <button
          v-if="embedded"
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xl leading-none text-gray-500 dark:border-white/10 dark:text-gray-300"
          aria-label="关闭"
          @click="emit('close')"
        >
          ×
        </button>
        <router-link v-else to="/" class="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-white/10">
          {{ t('auth.login.backHome') }}
        </router-link>
      </div>

      <form v-if="mode === 'login' && step === 'password'" class="space-y-4" @submit.prevent="handleLogin">
        <label class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.login.emailLabel') }}</span>
          <input v-model="email" type="email" required class="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.login.emailPlaceholder')" />
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.login.passwordLabel') }}</span>
          <input v-model="password" type="password" required class="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.login.passwordPlaceholder')" />
        </label>

        <div v-if="loginCaptchaEnabled" class="space-y-2">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.common.captchaLabel') }}</div>
          <ImageCaptcha
            v-if="captchaProvider === 'image'"
            ref="imageCaptchaRef"
            v-model="captchaPayload"
            :disabled="userAuthStore.loading"
            @config-stale="handleCaptchaConfigStale"
          />
          <TurnstileCaptcha
            v-else-if="captchaProvider === 'turnstile'"
            ref="turnstileRef"
            v-model="turnstileToken"
            :site-key="turnstileSiteKey"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <input v-model="rememberMe" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-orange-600" />
            {{ t('auth.login.rememberMe') }}
          </label>
          <button v-if="emailVerificationEnabled" type="button" class="font-semibold text-orange-600" @click="requestMode('forgot')">
            {{ t('auth.login.forgot') }}
          </button>
        </div>

        <div v-if="info" class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{{ info }}</div>
        <div v-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{{ error }}</div>

        <button type="submit" :disabled="userAuthStore.loading" class="w-full rounded-md bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
          {{ userAuthStore.loading ? t('auth.login.submitting') : t('auth.login.submit') }}
        </button>

        <div v-if="showTelegramWidget" class="space-y-3 pt-2">
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span class="h-px flex-1 bg-gray-200 dark:bg-white/10"></span>
            <span>{{ t('auth.login.telegramOr') }}</span>
            <span class="h-px flex-1 bg-gray-200 dark:bg-white/10"></span>
          </div>
          <div ref="telegramWidgetRef" class="flex justify-center"></div>
          <p class="text-center text-xs text-gray-500 dark:text-gray-400">{{ t('auth.login.telegramHint') }}</p>
          <button
            v-if="showTelegramMiniAppEntry"
            type="button"
            class="w-full rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold dark:border-white/10"
            @click="openTelegramMiniAppEntry"
          >
            {{ t('auth.login.telegramMiniAppEntryAction') }}
          </button>
        </div>

        <div class="text-center text-sm">
          <button type="button" class="font-semibold text-orange-600" @click="requestMode('register')">{{ t('auth.login.noAccount') }}</button>
        </div>
      </form>

      <form v-else-if="mode === 'login'" class="space-y-4" @submit.prevent="handleVerify2FA">
        <div class="rounded-md border border-orange-200 px-4 py-3 text-sm text-orange-700 dark:border-orange-500/30 dark:text-orange-200" style="background-color: var(--ui-accent-soft);">
          {{ t('auth.login.totp.countdown', { seconds: challengeRemainingSeconds }) }}
        </div>
        <label v-if="totpMode === 'code'" class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.login.totp.codeLabel') }}</span>
          <input v-model="totpCode" inputmode="numeric" maxlength="6" class="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-center text-sm tracking-[0.35em] outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.login.totp.codePlaceholder')" />
        </label>
        <label v-else class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.login.totp.recoveryLabel') }}</span>
          <input v-model="recoveryCode" class="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.login.totp.recoveryPlaceholder')" />
        </label>
        <button type="button" class="text-sm font-semibold text-orange-600" @click="totpMode = totpMode === 'code' ? 'recovery' : 'code'">
          {{ totpMode === 'code' ? t('auth.login.totp.useRecovery') : t('auth.login.totp.useCode') }}
        </button>
        <div v-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{{ error }}</div>
        <button type="submit" :disabled="userAuthStore.loading" class="w-full rounded-md bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
          {{ userAuthStore.loading ? t('auth.login.totp.verifying') : t('auth.login.totp.submit') }}
        </button>
        <button type="button" class="w-full rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold dark:border-white/10" @click="cancel2FA">
          {{ t('auth.login.totp.cancel') }}
        </button>
      </form>

      <div v-else-if="mode === 'register' && !registrationEnabled" class="rounded-md border border-gray-200 px-4 py-8 text-center dark:border-white/10">
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('auth.register.registrationDisabled') }}</p>
        <button type="button" class="mt-4 inline-block text-sm font-semibold text-orange-600" @click="requestMode('login')">{{ t('auth.register.hasAccount') }}</button>
      </div>

      <form v-else-if="mode === 'register'" class="space-y-4" @submit.prevent="handleRegister">
        <label class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.register.emailLabel') }}</span>
          <input v-model="email" type="email" required class="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.register.emailPlaceholder')" />
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.register.passwordLabel') }}</span>
          <input v-model="password" type="password" required class="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.register.passwordPlaceholder')" />
        </label>
        <div v-if="emailVerificationEnabled" class="space-y-4">
          <div v-if="sendCodeCaptchaEnabled" class="space-y-2">
            <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.common.captchaLabel') }}</div>
            <ImageCaptcha
              v-if="captchaProvider === 'image'"
              ref="imageCaptchaRef"
              v-model="captchaPayload"
              :disabled="sending || countdown > 0"
              @config-stale="handleCaptchaConfigStale"
            />
            <TurnstileCaptcha
              v-else-if="captchaProvider === 'turnstile'"
              ref="turnstileRef"
              v-model="turnstileToken"
              :site-key="turnstileSiteKey"
            />
          </div>
          <label class="block">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.register.codeLabel') }}</span>
            <div class="mt-2 flex gap-2">
              <input v-model="code" required class="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.register.codePlaceholder')" />
              <button type="button" :disabled="sending || countdown > 0" class="shrink-0 rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10" @click="handleSendCode">
                {{ countdown > 0 ? t('auth.common.countdown', { seconds: countdown }) : t('auth.common.sendCode') }}
              </button>
            </div>
          </label>
        </div>
        <label class="flex items-start gap-3 rounded-md border border-gray-200 p-4 text-sm text-gray-600 dark:border-white/10 dark:text-gray-300">
          <input v-model="agreed" type="checkbox" class="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600" />
          <span>
            {{ t('auth.register.agreementPrefix') }}
            <router-link to="/privacy" target="_blank" class="font-semibold text-orange-600">{{ t('footer.privacy') }}</router-link>
            {{ t('auth.register.agreementAnd') }}
            <router-link to="/terms" target="_blank" class="font-semibold text-orange-600">{{ t('footer.terms') }}</router-link>
          </span>
        </label>
        <div v-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{{ error }}</div>
        <button type="submit" :disabled="userAuthStore.loading || !agreed" class="w-full rounded-md bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
          {{ userAuthStore.loading ? t('auth.register.creating') : t('auth.register.create') }}
        </button>
        <div class="text-center text-sm">
          <button type="button" class="font-semibold text-orange-600" @click="requestMode('login')">{{ t('auth.register.hasAccount') }}</button>
        </div>
      </form>

      <div v-else-if="!emailVerificationEnabled" class="rounded-md border border-gray-200 px-4 py-8 text-center dark:border-white/10">
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('auth.forgot.disabled') }}</p>
        <button type="button" class="mt-4 inline-block text-sm font-semibold text-orange-600" @click="requestMode('login')">{{ t('auth.forgot.backLogin') }}</button>
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleReset">
        <label class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.forgot.emailLabel') }}</span>
          <input v-model="email" type="email" required class="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.forgot.emailPlaceholder')" />
        </label>
        <div v-if="sendCodeCaptchaEnabled" class="space-y-2">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.common.captchaLabel') }}</div>
          <ImageCaptcha
            v-if="captchaProvider === 'image'"
            ref="imageCaptchaRef"
            v-model="captchaPayload"
            :disabled="sending || countdown > 0"
            @config-stale="handleCaptchaConfigStale"
          />
          <TurnstileCaptcha
            v-else-if="captchaProvider === 'turnstile'"
            ref="turnstileRef"
            v-model="turnstileToken"
            :site-key="turnstileSiteKey"
          />
        </div>
        <label class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.forgot.codeLabel') }}</span>
          <div class="mt-2 flex gap-2">
            <input v-model="code" required class="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.forgot.codePlaceholder')" />
            <button type="button" :disabled="sending || countdown > 0" class="shrink-0 rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10" @click="handleSendCode">
              {{ countdown > 0 ? t('auth.common.countdown', { seconds: countdown }) : t('auth.common.sendCode') }}
            </button>
          </div>
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('auth.forgot.newPasswordLabel') }}</span>
          <input v-model="newPassword" type="password" required class="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('auth.forgot.newPasswordPlaceholder')" />
        </label>
        <div v-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{{ error }}</div>
        <button type="submit" :disabled="userAuthStore.loading" class="w-full rounded-md bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
          {{ userAuthStore.loading ? t('auth.forgot.submitting') : t('auth.forgot.submit') }}
        </button>
        <div class="text-center text-sm">
          <button type="button" class="font-semibold text-orange-600" @click="requestMode('login')">{{ t('auth.forgot.backLogin') }}</button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../../stores/app'
import { useUserAuthStore } from '../../../stores/userAuth'
import { useTelegramMiniAppStore } from '../../../stores/telegramMiniApp'
import { buildTelegramMiniAppEntryLink, isTelegramUrlEnvironment, openTelegramCompatibleLink } from '../../../utils/telegramMiniApp'
import { getImageUrl } from '../../../utils/image'
import { debounceAsync } from '../../../utils/debounce'
import type { CaptchaPayload, TelegramAuthPayload } from '../../../api'
import ImageCaptcha from '../../../components/captcha/ImageCaptcha.vue'
import TurnstileCaptcha from '../../../components/captcha/TurnstileCaptcha.vue'
import { mallAuthRedirectStorageKey } from '../utils'

const props = defineProps<{
  mode: 'login' | 'register' | 'forgot'
  embedded?: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
  'mode-change': [mode: 'login' | 'register' | 'forgot']
}>()

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userAuthStore = useUserAuthStore()
const telegramMiniAppStore = useTelegramMiniAppStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const newPassword = ref('')
const code = ref('')
const rememberMe = ref(true)
const agreed = ref(false)
const error = ref('')
const info = ref('')
const sending = ref(false)
const countdown = ref(0)
const captchaPayload = ref<CaptchaPayload>({})
const turnstileToken = ref('')
const imageCaptchaRef = ref<InstanceType<typeof ImageCaptcha> | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileCaptcha> | null>(null)
const telegramWidgetRef = ref<HTMLDivElement | null>(null)
const step = ref<'password' | 'totp'>('password')
const totpMode = ref<'code' | 'recovery'>('code')
const totpCode = ref('')
const recoveryCode = ref('')
const challengeRemainingSeconds = ref(0)
const miniAppLoginAttempted = ref(false)
const attemptingMiniAppLogin = ref(false)

let timer: number | undefined
let challengeTimer: number | undefined

const mode = computed(() => props.mode)
const siteName = computed(() => String(appStore.config?.brand?.site_name || 'Huli-Next').trim() || 'Huli-Next')
const siteInitial = computed(() => siteName.value.slice(0, 1).toUpperCase())
const siteIcon = computed(() => {
  const icon = String(appStore.config?.brand?.site_icon || '').trim()
  return icon ? getImageUrl(icon) : ''
})

const currentTitle = computed(() => {
  if (mode.value === 'register') return t('auth.register.title')
  if (mode.value === 'forgot') return t('auth.forgot.title')
  return step.value === 'totp' ? t('auth.login.totp.title') : t('auth.login.title')
})

const currentSubtitle = computed(() => {
  if (mode.value === 'register') return t('auth.register.subtitle')
  if (mode.value === 'forgot') return t('auth.forgot.subtitle')
  return step.value === 'totp' ? t('auth.login.totp.subtitle') : t('auth.login.subtitle')
})

const captchaConfig = computed(() => appStore.config?.captcha || null)
const captchaProvider = computed(() => String(captchaConfig.value?.provider || 'none').trim().toLowerCase())
const turnstileSiteKey = computed(() => String(captchaConfig.value?.turnstile?.site_key || '').trim())
const captchaProviderReady = computed(() => {
  if (captchaProvider.value === 'image') return true
  if (captchaProvider.value === 'turnstile') return turnstileSiteKey.value !== ''
  return false
})
const loginCaptchaEnabled = computed(() => !!captchaConfig.value?.scenes?.login && captchaProviderReady.value)
const sendCodeScene = computed(() => mode.value === 'forgot' ? 'reset_send_code' : 'register_send_code')
const sendCodeCaptchaEnabled = computed(() => !!captchaConfig.value?.scenes?.[sendCodeScene.value] && captchaProviderReady.value)
const registrationEnabled = computed(() => appStore.config?.registration_enabled !== false)
const emailVerificationEnabled = computed(() => appStore.config?.email_verification_enabled !== false)

const telegramConfig = computed(() => appStore.config?.telegram_auth || null)
const normalizeTelegramBotUsername = (value: unknown) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const urlMatch = raw.match(/^(?:https?:\/\/)?t\.me\/([^/?#]+)/i)
  return (urlMatch?.[1] || raw).trim().replace(/^@+/, '')
}
const telegramBotUsername = computed(() => normalizeTelegramBotUsername(telegramConfig.value?.bot_username))
const telegramMiniAppURL = computed(() => String(telegramConfig.value?.mini_app_url || '').trim())
const telegramEnabled = computed(() => !!telegramConfig.value?.enabled && telegramBotUsername.value !== '')
const isTelegramMiniApp = computed(() => telegramMiniAppStore.isMiniApp && telegramMiniAppStore.isReady)
const miniAppInitData = computed(() => String(telegramMiniAppStore.initData || '').trim())
const showTelegramWidget = computed(() => mode.value === 'login' && telegramEnabled.value && !isTelegramMiniApp.value)
const telegramMiniAppEntryLink = computed(() => buildTelegramMiniAppEntryLink(telegramBotUsername.value, telegramMiniAppURL.value))
const showTelegramMiniAppEntry = computed(() => mode.value === 'login' && !isTelegramMiniApp.value && isTelegramUrlEnvironment() && telegramMiniAppEntryLink.value !== '')
const telegramCallbackName = '__dujiaoMallTelegramLogin'

const embedded = computed(() => props.embedded === true)

const clearMessage = () => {
  error.value = ''
  info.value = ''
}

const startCountdown = () => {
  countdown.value = 60
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }, 1000)
}

const getCaptchaPayload = (enabled: boolean): CaptchaPayload | undefined => {
  if (!enabled) return undefined
  if (captchaProvider.value === 'image') {
    return {
      captcha_id: captchaPayload.value.captcha_id || '',
      captcha_code: captchaPayload.value.captcha_code || '',
    }
  }
  if (captchaProvider.value === 'turnstile') {
    return {
      turnstile_token: turnstileToken.value,
    }
  }
  return undefined
}

const ensureCaptchaReady = (enabled: boolean) => {
  if (!enabled) return true
  if (captchaProvider.value === 'image') {
    if (!captchaPayload.value.captcha_id || !captchaPayload.value.captcha_code) {
      error.value = t('auth.common.captchaRequired')
      return false
    }
  }
  if (captchaProvider.value === 'turnstile') {
    if (!turnstileToken.value) {
      error.value = t('auth.common.captchaRequired')
      return false
    }
  }
  return true
}

const resetCaptcha = () => {
  if (captchaProvider.value === 'image') {
    imageCaptchaRef.value?.refresh()
  }
  if (captchaProvider.value === 'turnstile') {
    turnstileRef.value?.reset()
    turnstileToken.value = ''
  }
}

const handleCaptchaConfigStale = async () => {
  await appStore.loadConfig(true)
  captchaPayload.value = {}
  turnstileToken.value = ''
}

const redirectAfterLogin = async () => {
  if (embedded.value) {
    emit('success')
    if (typeof window !== 'undefined') {
      const redirect = window.sessionStorage.getItem(mallAuthRedirectStorageKey) || ''
      window.sessionStorage.removeItem(mallAuthRedirectStorageKey)
      if (redirect.startsWith('/')) {
        await router.push(redirect)
      }
    }
    return
  }
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/me/orders'
  await router.push(redirect)
}

const requestMode = (nextMode: 'login' | 'register' | 'forgot') => {
  clearMessage()
  if (embedded.value) {
    emit('mode-change', nextMode)
    return
  }
  const path = nextMode === 'login' ? '/auth/login' : `/auth/${nextMode}`
  router.push(path)
}

const performLogin = async () => {
  clearMessage()
  if (!email.value || !password.value) return
  if (!ensureCaptchaReady(loginCaptchaEnabled.value)) return
  try {
    const result = await userAuthStore.login({
      email: email.value,
      password: password.value,
      remember_me: rememberMe.value,
      captcha_payload: getCaptchaPayload(loginCaptchaEnabled.value),
    })
    if (result?.requiresTotp) {
      enter2FAStep()
      return
    }
    await redirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.login.error')
    resetCaptcha()
  }
}

const performSendCode = async () => {
  clearMessage()
  if (!email.value) {
    error.value = mode.value === 'forgot' ? t('auth.forgot.errors.emailRequired') : t('auth.register.errors.emailRequired')
    return
  }
  if (countdown.value > 0) return
  if (!ensureCaptchaReady(sendCodeCaptchaEnabled.value)) return
  sending.value = true
  try {
    await userAuthStore.sendVerifyCode({
      email: email.value,
      purpose: mode.value === 'forgot' ? 'reset' : 'register',
      captcha_payload: getCaptchaPayload(sendCodeCaptchaEnabled.value),
    })
    startCountdown()
  } catch (err: any) {
    error.value = err.message || (mode.value === 'forgot' ? t('auth.forgot.errors.sendCodeFailed') : t('auth.register.errors.sendCodeFailed'))
    resetCaptcha()
  } finally {
    sending.value = false
  }
}

const performRegister = async () => {
  clearMessage()
  if (!email.value || !password.value) return
  if (emailVerificationEnabled.value && !code.value) return
  if (!agreed.value) {
    error.value = t('auth.register.errors.agreementRequired')
    return
  }
  try {
    await userAuthStore.register({
      email: email.value,
      password: password.value,
      code: emailVerificationEnabled.value ? code.value : '',
      agreement_accepted: agreed.value,
    })
    if (embedded.value) {
      emit('success')
      return
    }
    await router.push('/me/orders')
  } catch (err: any) {
    error.value = err.message || t('auth.register.errors.registerFailed')
  }
}

const performReset = async () => {
  clearMessage()
  if (!email.value || !code.value || !newPassword.value) return
  try {
    await userAuthStore.forgotPassword({
      email: email.value,
      code: code.value,
      password: newPassword.value,
    })
    if (embedded.value) {
      emit('mode-change', 'login')
      await nextTick()
      info.value = t('auth.login.passwordChangedTip')
      return
    }
    await router.push('/auth/login?reason=password_changed')
  } catch (err: any) {
    error.value = err.message || t('auth.forgot.errors.resetFailed')
  }
}

const stopChallengeCountdown = () => {
  if (challengeTimer) {
    clearInterval(challengeTimer)
    challengeTimer = undefined
  }
}

const startChallengeCountdown = () => {
  stopChallengeCountdown()
  const tick = () => {
    const expiresAt = userAuthStore.challengeExpiresAt
    if (!expiresAt) {
      challengeRemainingSeconds.value = 0
      stopChallengeCountdown()
      return
    }
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    challengeRemainingSeconds.value = diff
    if (diff <= 0) {
      stopChallengeCountdown()
      cancel2FA()
      error.value = t('auth.login.totp.expired')
    }
  }
  tick()
  challengeTimer = window.setInterval(tick, 1000)
}

const enter2FAStep = () => {
  step.value = 'totp'
  totpMode.value = 'code'
  totpCode.value = ''
  recoveryCode.value = ''
  startChallengeCountdown()
}

const cancel2FA = () => {
  stopChallengeCountdown()
  userAuthStore.clearChallenge()
  step.value = 'password'
  totpCode.value = ''
  recoveryCode.value = ''
  challengeRemainingSeconds.value = 0
}

const performVerify2FA = async () => {
  clearMessage()
  if (totpMode.value === 'code') {
    const value = totpCode.value.trim()
    if (!value) {
      error.value = t('auth.login.totp.codeRequired')
      return
    }
    try {
      await userAuthStore.verify2FA({ code: value })
      stopChallengeCountdown()
      await redirectAfterLogin()
    } catch (err: any) {
      error.value = err.message || t('auth.login.totp.verifyFailed')
      totpCode.value = ''
    }
    return
  }

  const recovery = recoveryCode.value.trim()
  if (!recovery) {
    error.value = t('auth.login.totp.recoveryRequired')
    return
  }
  try {
    await userAuthStore.verify2FA({ recovery_code: recovery })
    stopChallengeCountdown()
    await redirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.login.totp.verifyFailed')
    recoveryCode.value = ''
  }
}

const buildTelegramPayload = (raw: any): TelegramAuthPayload | null => {
  const id = Number(raw?.id)
  const authDate = Number(raw?.auth_date)
  const hash = String(raw?.hash || '').trim()
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(authDate) || authDate <= 0 || hash === '') {
    return null
  }
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

const handleTelegramAuth = async (raw: any) => {
  clearMessage()
  const payload = buildTelegramPayload(raw)
  if (!payload) {
    error.value = t('auth.login.telegramInvalidPayload')
    return
  }
  try {
    const result = await userAuthStore.telegramLogin(payload)
    if (result?.requiresTotp) {
      enter2FAStep()
      return
    }
    await redirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.login.telegramLoginFailed')
  }
}

const tryTelegramMiniAppLogin = async () => {
  if (mode.value !== 'login' || !isTelegramMiniApp.value || miniAppInitData.value === '' || miniAppLoginAttempted.value || attemptingMiniAppLogin.value) {
    return
  }
  miniAppLoginAttempted.value = true
  attemptingMiniAppLogin.value = true
  clearMessage()
  try {
    const result = await userAuthStore.telegramMiniAppLogin(miniAppInitData.value)
    if (result?.requiresTotp) {
      enter2FAStep()
      return
    }
    await redirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.login.telegramLoginFailed')
  } finally {
    attemptingMiniAppLogin.value = false
  }
}

const clearTelegramWidget = () => {
  if (telegramWidgetRef.value) {
    telegramWidgetRef.value.innerHTML = ''
  }
}

const renderTelegramWidget = async () => {
  await nextTick()
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
    error.value = t('auth.login.telegramWidgetLoadFailed')
  }
  telegramWidgetRef.value.appendChild(script)
}

const openTelegramMiniAppEntry = () => {
  if (telegramMiniAppEntryLink.value === '') return
  openTelegramCompatibleLink(telegramMiniAppEntryLink.value)
}

const handleLogin = debounceAsync(performLogin, 200)
const handleSendCode = debounceAsync(performSendCode, 200)
const handleRegister = debounceAsync(performRegister, 200)
const handleReset = debounceAsync(performReset, 200)
const handleVerify2FA = debounceAsync(performVerify2FA, 200)

watch(() => props.mode, () => {
  clearMessage()
  step.value = 'password'
  code.value = ''
  password.value = ''
  newPassword.value = ''
  agreed.value = false
  captchaPayload.value = {}
  turnstileToken.value = ''
})

watch([showTelegramWidget, telegramBotUsername], () => {
  void renderTelegramWidget()
})

watch([isTelegramMiniApp, miniAppInitData], () => {
  void tryTelegramMiniAppLogin()
})

onMounted(async () => {
  await appStore.loadConfig(true)
  if (mode.value === 'login' && route.query.reason === 'password_changed') {
    info.value = t('auth.login.passwordChangedTip')
  }
  const win = window as Window & Record<string, any>
  win[telegramCallbackName] = handleTelegramAuth
  await renderTelegramWidget()
  await tryTelegramMiniAppLogin()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  stopChallengeCountdown()
  const win = window as Window & Record<string, any>
  delete win[telegramCallbackName]
  clearTelegramWidget()
})
</script>
