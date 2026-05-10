<template>
  <section class="border-y border-gray-100 bg-white p-4 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-5 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-lg font-black text-gray-950 dark:text-white sm:text-xl">{{ t('personalCenter.giftCard.title') }}</h2>
        <p class="mt-1 break-words text-sm leading-6 text-gray-500 dark:text-gray-400">{{ t('personalCenter.giftCard.subtitle') }}</p>
      </div>
      <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#ff5000] dark:bg-orange-500/10">
        {{ t('personalCenter.tabs.giftCard') }}
      </span>
    </div>

    <div v-if="panelAlert" class="mt-4 rounded-xl border px-4 py-3 text-sm" :class="mallAlertClass(panelAlert.level)">
      {{ panelAlert.message }}
    </div>

    <div v-if="lastRedeem" class="mt-4 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 sm:grid-cols-3">
      <div>
        <div class="text-xs opacity-75">{{ t('personalCenter.giftCard.successCode') }}</div>
        <div class="mt-1 break-all font-mono font-black">{{ lastRedeem.gift_card?.code || '-' }}</div>
      </div>
      <div>
        <div class="text-xs opacity-75">{{ t('personalCenter.giftCard.successAmount') }}</div>
        <div class="mt-1 font-black">{{ redeemedAmountText }}</div>
      </div>
      <div>
        <div class="text-xs opacity-75">{{ t('personalCenter.giftCard.successBalance') }}</div>
        <div class="mt-1 font-black">{{ currentBalanceText }}</div>
      </div>
    </div>

    <form class="mt-5 max-w-2xl space-y-4" @submit.prevent="submitRedeem">
      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('personalCenter.giftCard.codeLabel') }}</span>
        <input
          v-model.trim="redeemForm.code"
          maxlength="80"
          autocomplete="off"
          class="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 font-mono text-xs uppercase tracking-[0.04em] outline-none transition focus:border-[#ff5000] dark:border-white/10 dark:bg-neutral-900 sm:text-sm sm:tracking-[0.08em]"
          :placeholder="t('personalCenter.giftCard.codePlaceholder')"
        />
      </label>

      <div v-if="redeemCaptchaEnabled" class="max-w-full overflow-hidden rounded-xl border border-gray-200 px-3 py-3 dark:border-white/10 sm:px-4">
        <p class="mb-2 text-xs font-bold text-gray-500">{{ t('auth.common.captchaLabel') }}</p>
        <ImageCaptcha
          v-if="captchaProvider === 'image'"
          ref="imageCaptchaRef"
          v-model="captchaPayload"
          :disabled="submitting"
          @config-stale="handleCaptchaConfigStale"
        />
        <TurnstileCaptcha
          v-else-if="captchaProvider === 'turnstile'"
          ref="turnstileRef"
          v-model="turnstileToken"
          :site-key="turnstileSiteKey"
        />
      </div>

      <div class="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
        <button
          type="submit"
          :disabled="submitting"
          class="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#ff5000] px-6 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {{ submitting ? t('personalCenter.giftCard.redeeming') : t('personalCenter.giftCard.redeemButton') }}
        </button>
        <button
          type="button"
          :disabled="submitting"
          class="inline-flex h-11 w-full items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-bold hover:text-[#ff5000] disabled:opacity-60 dark:border-white/10 sm:w-auto"
          @click="resetForm"
        >
          {{ t('personalCenter.giftCard.resetButton') }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { giftCardAPI, type CaptchaPayload, type GiftCardRedeemResult } from '../../../../api'
import { useAppStore } from '../../../../stores/app'
import ImageCaptcha from '../../../../components/captcha/ImageCaptcha.vue'
import TurnstileCaptcha from '../../../../components/captcha/TurnstileCaptcha.vue'
import { formatMallMoney } from '../../utils'
import { mallAlertClass, type MallAlert } from './shared'

const { t } = useI18n()
const appStore = useAppStore()

const redeemForm = reactive({ code: '' })
const submitting = ref(false)
const panelAlert = ref<MallAlert | null>(null)
const lastRedeem = ref<GiftCardRedeemResult | null>(null)
const captchaPayload = ref<CaptchaPayload>({})
const turnstileToken = ref('')
const imageCaptchaRef = ref<InstanceType<typeof ImageCaptcha> | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileCaptcha> | null>(null)

const captchaConfig = computed(() => appStore.config?.captcha || null)
const captchaProvider = computed(() => String(captchaConfig.value?.provider || 'none'))
const redeemCaptchaEnabled = computed(() => Boolean(captchaConfig.value?.scenes?.gift_card_redeem) && captchaProvider.value !== 'none')
const turnstileSiteKey = computed(() => String(captchaConfig.value?.turnstile?.site_key || ''))
const currency = computed(() => String(lastRedeem.value?.gift_card?.currency || appStore.config?.currency || 'CNY'))
const redeemedAmountText = computed(() => formatMallMoney(lastRedeem.value?.wallet_delta || lastRedeem.value?.gift_card?.amount || '', currency.value))
const currentBalanceText = computed(() => formatMallMoney(lastRedeem.value?.wallet?.balance || '', currency.value))

const resetCaptcha = () => {
  captchaPayload.value = {}
  turnstileToken.value = ''
  imageCaptchaRef.value?.refresh()
  turnstileRef.value?.reset()
}

const getCaptchaPayload = (): CaptchaPayload | undefined => {
  if (!redeemCaptchaEnabled.value) return undefined
  if (captchaProvider.value === 'image') {
    return {
      captcha_id: captchaPayload.value.captcha_id || '',
      captcha_code: captchaPayload.value.captcha_code || '',
    }
  }
  if (captchaProvider.value === 'turnstile') {
    return { turnstile_token: turnstileToken.value || '' }
  }
  return undefined
}

const ensureCaptchaPassed = () => {
  if (!redeemCaptchaEnabled.value) return true
  if (captchaProvider.value === 'image') return Boolean(captchaPayload.value.captcha_id && captchaPayload.value.captcha_code)
  if (captchaProvider.value === 'turnstile') return Boolean(turnstileToken.value)
  return true
}

const handleCaptchaConfigStale = async () => {
  await appStore.loadConfig(true)
  resetCaptcha()
}

const resetForm = () => {
  redeemForm.code = ''
  lastRedeem.value = null
  panelAlert.value = null
  resetCaptcha()
}

const submitRedeem = async () => {
  panelAlert.value = null
  const code = redeemForm.code.trim().toUpperCase()
  if (!code) {
    panelAlert.value = { level: 'warning', message: t('personalCenter.giftCard.errors.codeRequired') }
    return
  }
  if (!ensureCaptchaPassed()) {
    panelAlert.value = { level: 'warning', message: t('auth.common.captchaRequired') }
    return
  }

  submitting.value = true
  try {
    const response = await giftCardAPI.redeem({ code, captcha_payload: getCaptchaPayload() })
    lastRedeem.value = response.data.data || null
    redeemForm.code = ''
    panelAlert.value = {
      level: 'success',
      message: t('personalCenter.giftCard.redeemSuccess', {
        amount: String(lastRedeem.value?.wallet_delta || lastRedeem.value?.gift_card?.amount || ''),
        currency: currency.value,
      }),
    }
    resetCaptcha()
  } catch (err: any) {
    panelAlert.value = { level: 'error', message: err?.message || t('personalCenter.giftCard.errors.redeemFailed') }
    resetCaptcha()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!appStore.config) void appStore.loadConfig()
})
</script>
