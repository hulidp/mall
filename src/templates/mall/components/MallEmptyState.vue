<template>
  <div 
    class="flex min-h-[280px] flex-col items-center justify-center rounded-xl border px-6 py-12 text-center"
    style="background-color: var(--ui-bg-elevated); border-color: var(--ui-border);"
  >
    <div 
      class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
      style="background-color: var(--ui-accent-soft); color: var(--ui-accent);"
    >
      <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V7a2 2 0 00-2-2h-3.5M4 13V7a2 2 0 012-2h3.5m0 0L12 3l2.5 2M9.5 5h5M4 13l8 4 8-4M4 13v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
      </svg>
    </div>
    <h2 class="text-base font-semibold" style="color: var(--ui-text-primary);">{{ title }}</h2>
    <p v-if="description" class="mt-2 max-w-sm text-sm leading-relaxed" style="color: var(--ui-text-muted);">{{ description }}</p>
    <router-link
      v-if="actionTo && actionLabel"
      :to="actionTo"
      class="theme-btn-primary theme-btn-inline-md mt-6 rounded-lg border text-sm font-medium"
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
