<script setup lang="ts">
import { defineProps, computed, ref } from 'vue'
import { Link } from '@inertiajs/vue3'

const props = defineProps({
  redirectionPath: {
    type: String,
    default: '',
  },
  textColor: {
    type: String,
    default: 'white',
  },
  value: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#5C4741'
  },
  useRedirection: {
    type: Boolean,
    default: true
  }
})

const isHovered = ref(false)

const getHoverColor = computed(() => {
  if (isHovered.value) {
    switch (props.color) {
      case '#5C4741':
        return '#7b5f57'
      case '#7B5F57':
        return '#E6C5BE'
      case '#D6B7B0':
        return '#E6C5BE'
      default:
        return props.color
    }
  } else {
    return props.color
  }
})

</script>

<template>
  <component
    :is="props.useRedirection ? Link : 'button'"
    :href="props.useRedirection ? props.redirectionPath : undefined"
    :style="{
      backgroundColor: isHovered ? getHoverColor : props.color,
      color: props.textColor
    }"
    class="font-semibold px-6 py-3 rounded-lg transition cursor-pointer"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    {{ props.value }}
  </component>
</template>
