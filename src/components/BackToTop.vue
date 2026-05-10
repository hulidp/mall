<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-90"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-90"
  >
    <button
      v-if="visible"
      @click="scrollToTop"
      class="back-to-top fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200/80 bg-white/95 text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.14)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:shadow-[0_12px_28px_rgba(15,23,42,0.18)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 md:right-6 lg:z-50 dark:border-white/10 dark:bg-neutral-950/90 dark:text-gray-200 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
      :aria-label="t('common.backToTop')"
    >
      <ChevronUpIcon class="h-5 w-5 stroke-[2.2]" aria-hidden="true" />
      <span class="sr-only">{{ t('common.backToTop') }}</span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronUpIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const visible = ref(false)

const onScroll = () => {
  visible.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
/* Mobile: sit above bottom nav (h-14 = 3.5rem) + safe area, with breathing room */
.back-to-top {
  bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px) + 1rem);
}
@media (min-width: 1024px) {
  .back-to-top {
    bottom: 1.5rem;
  }
}
</style>
