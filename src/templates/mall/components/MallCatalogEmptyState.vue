<template>
  <div class="relative overflow-hidden rounded-lg border border-gray-200 bg-white px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-neutral-950">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-1 bg-orange-600"></div>
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
      <ArchiveBoxIcon class="h-7 w-7 stroke-[1.7]" aria-hidden="true" />
    </div>
    <p class="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-300">
      {{ t('home.emptyCatalog.kicker') }}
    </p>
    <h2 class="mt-2 text-2xl font-black text-gray-950 dark:text-white">
      {{ t('home.emptyCatalog.title') }}
    </h2>
    <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
      {{ t('home.emptyCatalog.description') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ArchiveBoxIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
