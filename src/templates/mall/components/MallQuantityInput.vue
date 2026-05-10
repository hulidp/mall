<template>
  <div class="inline-flex h-10 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-white/10 dark:bg-neutral-950">
    <button
      type="button"
      class="w-10 text-lg text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/5"
      :disabled="modelValue <= min"
      @click="emit('update:modelValue', Math.max(min, modelValue - 1))"
    >
      -
    </button>
    <input
      :value="modelValue"
      inputmode="numeric"
      class="w-14 border-x border-gray-200 bg-transparent text-center text-sm font-semibold outline-none dark:border-white/10"
      @input="handleInput"
    />
    <button
      type="button"
      class="w-10 text-lg text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/5"
      :disabled="max !== null && modelValue >= max"
      @click="emit('update:modelValue', max === null ? modelValue + 1 : Math.min(max, modelValue + 1))"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min?: number
  max?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const min = props.min || 1
const max = props.max ?? null

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const raw = Math.floor(Number(input.value) || min)
  const bounded = max === null ? Math.max(min, raw) : Math.min(Math.max(min, raw), max)
  emit('update:modelValue', bounded)
}
</script>
