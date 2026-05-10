<template>
  <div class="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-gray-500 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-400">
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 13V7a2 2 0 00-2-2h-3.5M4 13V7a2 2 0 012-2h3.5m0 0L12 3l2.5 2M9.5 5h5M4 13l8 4 8-4M4 13v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
      </svg>
    </div>
    <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
    <p v-if="description" class="mt-2 max-w-md text-sm leading-6">{{ description }}</p>
    <router-link
      v-if="actionTo && actionLabel"
      :to="actionTo"
      class="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
    >
      {{ actionLabel }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}>()
</script>
