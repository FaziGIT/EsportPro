<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '../../resources/js/composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  label: string
  value: string | null
  isEditable?: boolean
  error?: string
}>()

const emit = defineEmits(['update:value'])

const inputValue = ref(props.value || '')
const valueRef = ref<HTMLElement | null>(null)

watch(
  () => props.value,
  (newValue) => {
    inputValue.value = newValue || ''
  }
)

watch(
  () => props.isEditable,
  (newValue) => {
    if (newValue) {
      inputValue.value = props.value || ''
    }
  }
)

const updateValue = () => {
  emit('update:value', inputValue.value)
}
</script>

<template>
  <div class="flex flex-col">
    <span class="text-sm text-gray-600">{{ label }}</span>
    <div v-if="isEditable" class="w-full">
      <input
        v-model="inputValue"
        class="border border-[#5C4741] rounded p-1 bg-[#F5F5F5] w-full sm:w-64 min-w-[40px]"
        type="text"
        @change="updateValue"
        :class="{ 'border-red-500': error }"
        :placeholder="t('profile.validCharactersOnly')"
      />
      <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
    </div>

    <template v-else>
      <div
        ref="valueRef"
        class="border border-[#5C4741] rounded bg-[#F5F5F5] truncate overflow-hidden whitespace-nowrap cursor-default w-fit max-w-100% min-w-4"
        :class="inputValue ? 'p-1' : 'p-4'"
      >
        {{ value }}
      </div>
    </template>
  </div>
</template>
