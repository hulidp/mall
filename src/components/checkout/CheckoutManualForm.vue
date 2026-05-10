<template>
  <div
    v-if="manualFormProducts.length"
    class="border-y theme-panel px-3 py-2.5 sm:rounded-2xl sm:border sm:p-6"
  >
    <template v-if="hasDeliveryManualFields">
      <h2 class="mb-1 text-base font-bold theme-text-primary sm:mb-2 sm:text-lg">{{ t('checkout.manualFormTitle') }}</h2>
      <p class="mb-2 text-xs theme-text-muted sm:mb-4">{{ t('checkout.manualFormTip') }}</p>
    </template>
    <div class="space-y-2 sm:space-y-5">
      <div
        v-for="manualItem in manualFormProducts"
        :key="manualItem.itemKey"
        class="border-y theme-surface-soft py-2.5 sm:rounded-xl sm:border sm:p-4"
      >
        <h3 class="mb-2 break-words text-sm font-semibold theme-text-primary sm:mb-3">{{ manualItemTitle(manualItem) }}</h3>
        <div v-if="selectableCardFields(manualItem).length" class="mb-3 space-y-2 sm:mb-4 sm:space-y-3">
          <MallManualCardPicker
            v-for="field in selectableCardFields(manualItem)"
            :key="`${manualItem.itemKey}-${field.key}`"
            :model-value="getFieldValue(manualItem.itemKey, field.key)"
            :product-slug="manualItem.slug"
            :sku-id="manualItem.skuId"
            :field="field"
            @update:model-value="updateFieldValue(manualItem.itemKey, field.key, $event)"
          />
        </div>
        <div class="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-4">
          <div v-for="field in deliveryManualFields(manualItem)" :key="`${manualItem.itemKey}-${field.key}`" class="space-y-1.5">
            <label class="text-xs font-semibold theme-text-secondary">
              {{ getManualFieldLabel(field) }}
              <span v-if="field.required" class="ml-1 text-red-500">*</span>
            </label>

            <textarea
              v-if="field.type === 'textarea'"
              :value="getFieldValue(manualItem.itemKey, field.key)"
              @input="updateFieldValue(manualItem.itemKey, field.key, ($event.target as HTMLTextAreaElement).value)"
              rows="3"
              class="w-full form-input-compact"
              :placeholder="getManualFieldPlaceholder(field)"
            />

            <select
              v-else-if="field.type === 'select'"
              :value="getFieldValue(manualItem.itemKey, field.key)"
              @change="updateFieldValue(manualItem.itemKey, field.key, ($event.target as HTMLSelectElement).value)"
              class="w-full form-input-compact"
            >
              <option value="">{{ t('checkout.manualFormSelectPlaceholder') }}</option>
              <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
            </select>

            <div v-else-if="field.type === 'radio'" class="space-y-2 rounded-xl border theme-surface-soft p-3">
              <label v-for="option in field.options" :key="option" class="flex items-center gap-2 text-sm theme-text-secondary">
                <input
                  :checked="getFieldValue(manualItem.itemKey, field.key) === option"
                  @change="updateFieldValue(manualItem.itemKey, field.key, option)"
                  type="radio"
                  :name="`manual-radio-${manualItem.itemKey}-${field.key}`"
                  :value="option"
                  class="h-4 w-4"
                />
                <span>{{ option }}</span>
              </label>
            </div>

            <div v-else-if="field.type === 'checkbox'" class="space-y-2 rounded-xl border theme-surface-soft p-3">
              <label v-for="option in field.options" :key="option" class="flex items-center gap-2 text-sm theme-text-secondary">
                <input
                  :checked="isCheckboxChecked(manualItem.itemKey, field.key, option)"
                  @change="toggleCheckboxValue(manualItem.itemKey, field.key, option, ($event.target as HTMLInputElement).checked)"
                  type="checkbox"
                  :value="option"
                  class="h-4 w-4"
                />
                <span>{{ option }}</span>
              </label>
            </div>

            <input
              v-else
              :value="getFieldValue(manualItem.itemKey, field.key)"
              @input="updateFieldValue(manualItem.itemKey, field.key, ($event.target as HTMLInputElement).value)"
              :type="field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'"
              class="w-full form-input-compact"
              :placeholder="getManualFieldPlaceholder(field)"
            />

            <p
              v-if="submitAttempted && manualFieldError(manualItem.itemKey, field.key)"
              class="text-xs text-red-500"
            >
              {{ manualFieldError(manualItem.itemKey, field.key) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalized } from '../../composables/useProduct'
import MallManualCardPicker from '../../templates/mall/components/MallManualCardPicker.vue'

interface ManualFormField {
  key: string
  type: string
  required: boolean
  label?: Record<string, string>
  placeholder?: Record<string, string>
  regex?: string
  min?: number
  max?: number
  max_len?: number
  source?: string
  page_size?: number
  options: string[]
}

interface ManualFormProduct {
  itemKey: string
  productId: number
  slug?: string
  skuId?: number
  title: any
  fields: ManualFormField[]
  skuCount: number
}

const props = defineProps<{
  manualFormProducts: ManualFormProduct[]
  modelValue: Record<string, Record<string, any>>
  submitAttempted: boolean
  getManualFieldLabel: (field: ManualFormField) => string
  getManualFieldPlaceholder: (field: ManualFormField) => string
  manualFieldError: (itemKey: string, fieldKey: string) => string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, Record<string, any>>): void
}>()

const { t } = useI18n()
const { getLocalizedText } = useLocalized()

const selectableCardFields = (manualItem: ManualFormProduct) => manualItem.fields.filter((field) => field.type === 'card_picker')
const deliveryManualFields = (manualItem: ManualFormProduct) => manualItem.fields.filter((field) => field.type !== 'card_picker')
const hasDeliveryManualFields = computed(() => props.manualFormProducts.some((manualItem) => deliveryManualFields(manualItem).length > 0))

const manualItemTitle = (manualItem: ManualFormProduct) => {
  const productTitle = getLocalizedText(manualItem.title)
  if (manualItem.skuCount <= 1) return productTitle
  return `${productTitle} (${t('checkout.manualFormAppliesToSkuCount', { count: manualItem.skuCount })})`
}

const getFieldValue = (itemKey: string, fieldKey: string) => {
  return props.modelValue[itemKey]?.[fieldKey] ?? ''
}

const updateFieldValue = (itemKey: string, fieldKey: string, value: any) => {
  const updated = { ...props.modelValue }
  if (!updated[itemKey]) {
    updated[itemKey] = {}
  }
  updated[itemKey] = { ...updated[itemKey], [fieldKey]: value }
  emit('update:modelValue', updated)
}

const isCheckboxChecked = (itemKey: string, fieldKey: string, option: string) => {
  const value = props.modelValue[itemKey]?.[fieldKey]
  return Array.isArray(value) && value.includes(option)
}

const toggleCheckboxValue = (itemKey: string, fieldKey: string, option: string, checked: boolean) => {
  const current = props.modelValue[itemKey]?.[fieldKey]
  const list = Array.isArray(current) ? [...current] : []
  if (checked) {
    if (!list.includes(option)) list.push(option)
  } else {
    const idx = list.indexOf(option)
    if (idx !== -1) list.splice(idx, 1)
  }
  updateFieldValue(itemKey, fieldKey, list)
}
</script>
