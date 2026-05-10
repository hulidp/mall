<template>
  <div class="w-full">
    <section class="border-y border-gray-100 bg-white p-2.5 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-3xl sm:border-0 sm:p-6 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-lg font-black text-gray-950 dark:text-white sm:text-xl">{{ t('personalCenter.profile.title') }}</h2>
          <p class="mt-0.5 break-words text-xs leading-5 text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm sm:leading-6">{{ t('personalCenter.profile.subtitle') }}</p>
        </div>
        <span class="rounded-full px-3 py-1 text-xs font-bold" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
          {{ t('personalCenter.tabs.profile') }}
        </span>
      </div>

      <div v-if="alertMessage" class="mt-3 rounded-xl border px-3 py-2 text-sm sm:mt-4 sm:px-4 sm:py-3" :class="alertClass">
        {{ alertMessage }}
      </div>

      <form class="mt-3 grid gap-2.5 md:grid-cols-2 md:gap-4 sm:mt-6" @submit.prevent="saveProfile">
        <label class="block md:col-span-2">
          <span class="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200 sm:mb-2 sm:text-sm">{{ t('personalCenter.profile.emailLabel') }}</span>
          <input
            :value="accountEmail"
            disabled
            class="h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 sm:h-11 sm:rounded-xl"
          />
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200 sm:mb-2 sm:text-sm">{{ t('personalCenter.profile.nicknameLabel') }}</span>
          <input
            v-model="profileForm.nickname"
            :placeholder="t('personalCenter.profile.nicknamePlaceholder')"
            class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus: dark:border-white/10 dark:bg-neutral-900 sm:h-11 sm:rounded-xl" style="border-color: var(--ui-accent);"
          />
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200 sm:mb-2 sm:text-sm">{{ t('personalCenter.profile.localeLabel') }}</span>
          <select
            v-model="profileForm.locale"
            class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus: dark:border-white/10 dark:bg-neutral-900 sm:h-11 sm:rounded-xl" style="border-color: var(--ui-accent);"
          >
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="en-US">English</option>
          </select>
        </label>

        <div class="grid gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10 sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:pt-4 md:col-span-2">
          <button
            type="submit"
            :disabled="userProfileStore.savingProfile"
            class="inline-flex h-10 w-full items-center justify-center rounded-full px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-auto" style="background-color: var(--ui-accent);"
          >
            {{ userProfileStore.savingProfile ? t('personalCenter.profile.saving') : t('personalCenter.profile.save') }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../../../stores/app'
import { useUserAuthStore } from '../../../../stores/userAuth'
import { useUserProfileStore } from '../../../../stores/userProfile'

const { t } = useI18n()
const appStore = useAppStore()
const userAuthStore = useUserAuthStore()
const userProfileStore = useUserProfileStore()

const profileForm = reactive({
  nickname: '',
  locale: 'zh-CN',
})
const alertLevel = ref<'success' | 'error' | ''>('')
const alertMessage = ref('')

const alertClass = computed(() => {
  if (alertLevel.value === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
  }
  return 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
})
const accountEmail = computed(() => userProfileStore.profile?.email || userAuthStore.user?.email || '')

const saveProfile = async () => {
  alertLevel.value = ''
  alertMessage.value = ''
  const ok = await userProfileStore.saveProfile({
    nickname: profileForm.nickname.trim(),
    locale: profileForm.locale,
  })
  if (!ok) {
    alertLevel.value = 'error'
    alertMessage.value = userProfileStore.profileError || t('personalCenter.common.saveFailed')
    return
  }
  appStore.setLocale(profileForm.locale)
  alertLevel.value = 'success'
  alertMessage.value = t('personalCenter.profile.saveSuccess')
}

watch(
  () => userProfileStore.profile,
  (profile) => {
    if (!profile) return
    profileForm.nickname = profile.nickname || ''
    profileForm.locale = profile.locale || appStore.locale || 'zh-CN'
  },
  { immediate: true },
)
</script>
