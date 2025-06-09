<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { defineProps, computed, ref } from 'vue'
import HeartIconSVG from '~/components/icons/HeartIconSVG.vue'
import { useI18n } from '../../resources/js/composables/useI18n'

const { t } = useI18n()

defineProps({
  game: {
    type: Object,
    required: true,
  },
})

const isHovered = ref(false)
const heartIconColor = computed(() => (isHovered.value ? '#5C4741' : '#D6B7B0'))

</script>

<template>
  <div class="flex flex-col justify-between w-50 h-50 min-w-40 rounded-xl shadow-md bg-white overflow-hidden border border-gray-200">
    <div class="bg-gray-100 h-48 flex items-center justify-center">
<!--      <img-->
<!--        v-if="game.image && game.image.length > 0"-->
<!--        :src="game.image"-->
<!--        alt="Game Image"-->
<!--        class="w-full h-full object-cover"-->
<!--      />-->
      <div class="flex flex-col items-center justify-center text-gray-500">
        <img :src="imageNotFound" alt="Placeholder" class="w-12 h-12 mb-2" />
      </div>
    </div>

    <div class="p-4 flex flex-col justify-between flex-grow">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-bold text-black truncate max-w-[calc(100%-28px)]">
          {{ game.name || t('i18n.gameNameUndefined') }}
        </h3>
        <HeartIconSVG :color="heartIconColor" class="flex-shrink-0 cursor-pointer" @mouseenter="isHovered = true" @mouseleave="isHovered = false"/>
      </div>
    </div>
  </div>
</template>
