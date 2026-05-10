<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { captchaAPI, type CaptchaPayload } from '../../api'

const props = withDefaults(defineProps<{
  modelValue?: CaptchaPayload
  disabled?: boolean
}>(), {
  modelValue: () => ({}),
  disabled: false,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: CaptchaPayload): void
  (event: 'config-stale'): void
}>()

const loading = ref(false)
const imageBase64 = ref('')
const captchaID = ref(props.modelValue?.captcha_id || '')
const captchaCode = ref(props.modelValue?.captcha_code || '')

const syncModel = () => {
  emit('update:modelValue', {
    captcha_id: captchaID.value,
    captcha_code: captchaCode.value,
  })
}

const refresh = async (clearCode = true) => {
  loading.value = true
  try {
    const res = await captchaAPI.image()
    const data = res.data?.data as { captcha_id?: string; image_base64?: string } | undefined
    captchaID.value = String(data?.captcha_id || '')
    imageBase64.value = String(data?.image_base64 || '')
    if (clearCode) {
      captchaCode.value = ''
    }
    syncModel()
  } catch {
    captchaID.value = ''
    imageBase64.value = ''
    captchaCode.value = ''
    syncModel()
    emit('config-stale')
  } finally {
    loading.value = false
  }
}

const clear = () => {
  captchaCode.value = ''
  syncModel()
}

watch(captchaCode, () => {
  syncModel()
})

onMounted(() => {
  refresh()
})

defineExpose({
  refresh,
  clear,
})
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
    <div class="flex shrink-0 items-center gap-2">
      <img
        v-if="imageBase64"
        :src="imageBase64"
        alt="captcha"
        class="h-10 w-[108px] rounded-md border border-gray-200 bg-gray-50 object-contain dark:border-white/10 dark:bg-white/5"
      />
      <button
        type="button"
        class="h-9 shrink-0 rounded-md border border-gray-200 px-3 text-xs font-semibold text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-400 dark:/40 dark:"
        :disabled="disabled || loading"
        @click="refresh()"
      >
        {{ loading ? '刷新中...' : '换一张' }}
      </button>
    </div>
    <input
      v-model="captchaCode"
      type="text"
      class="h-10 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-black/20 dark:text-gray-100"
      placeholder="请输入图片验证码"
      :disabled="disabled"
      autocomplete="off"
    />
  </div>
</template>
