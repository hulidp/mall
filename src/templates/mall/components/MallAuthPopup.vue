<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-120 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-4 backdrop-blur-[2px] sm:py-5"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <div class="max-h-[calc(100dvh-2rem)] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-neutral-950 dark:ring-white/10 sm:max-h-[calc(100dvh-40px)]">
          <MallAuth
            :mode="mode"
            embedded
            @close="close"
            @success="close"
            @mode-change="updateMode"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import MallAuth from '../pages/MallAuth.vue'
import type { MallAuthModalMode } from '../utils'
import { lockMallBodyScroll, unlockMallBodyScroll } from '../utils'

const props = defineProps<{
  visible: boolean
  mode: MallAuthModalMode
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:mode': [value: MallAuthModalMode]
}>()

let bodyScrollLocked = false

const close = () => {
  emit('update:visible', false)
}

const updateMode = (mode: MallAuthModalMode) => {
  emit('update:mode', mode)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) close()
}

const syncBodyScrollLock = (visible: boolean) => {
  if (visible && !bodyScrollLocked) {
    lockMallBodyScroll()
    bodyScrollLocked = true
    return
  }
  if (!visible && bodyScrollLocked) {
    unlockMallBodyScroll()
    bodyScrollLocked = false
  }
}

watch(
  () => props.visible,
  (visible) => {
    syncBodyScrollLock(visible)
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (bodyScrollLocked) {
    unlockMallBodyScroll()
    bodyScrollLocked = false
  }
})
</script>
