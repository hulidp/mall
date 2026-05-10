<template>
  <div class="mx-auto flex min-h-[calc(100vh-220px)] max-w-[760px] items-center px-4 py-10 sm:px-6 lg:px-8">
    <section class="w-full rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 dark:bg-neutral-950 dark:ring-white/10">
      <p class="text-7xl font-black text-orange-600">404</p>
      <h1 class="mt-4 text-2xl font-black text-gray-950 dark:text-white">{{ t('notFoundPage.title') }}</h1>
      <p class="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{{ t('notFoundPage.description', { site: siteName }) }}</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <router-link to="/" class="rounded-md bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700">{{ t('notFoundPage.backHome') }}</router-link>
        <router-link to="/products" class="rounded-md border border-gray-200 px-5 py-3 text-sm font-bold hover:border-orange-500 hover:text-orange-600 dark:border-white/10">{{ t('nav.products') }}</router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../../stores/app'

const { t } = useI18n()
const appStore = useAppStore()
const siteName = computed(() => String(appStore.config?.brand?.site_name || 'Huli-Next').trim() || 'Huli-Next')
</script>
