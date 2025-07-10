<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { computed, defineProps, ref } from 'vue'
import HeartIconSVG from '~/components/icons/HeartIconSVG.vue'
import { useI18n } from '../../resources/js/composables/useI18n'
import User from '#models/user'
import { usePage } from '@inertiajs/vue3'
import Game from '#models/game'

const { t } = useI18n()

const props = defineProps({
  game: {
    type: Object as () => Partial<Game>,
    required: true,
  },
})

const imageSource = computed(() => {
  if (props.game?.id) {
    return `/games/${props.game?.id}/image`
  }

  return imageNotFound
})

const isHovered = ref(false)
const heartIconColor = computed(() => (isHovered.value ? '#5C4741' : '#D6B7B0'))

const page = usePage()
const user = computed(() => page.props.user as User)

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}
</script>

<template>
  <div
    class="flex flex-col w-50 h-50 min-w-40 rounded-xl shadow-md bg-white overflow-hidden border border-gray-200"
  >
    <div class="bg-gray-100 h-32 flex items-center justify-center flex-shrink-0">
      <img
        :src="imageSource"
        alt="Game Image"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
    </div>

    <div class="p-4 flex flex-col justify-between flex-grow">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-bold text-black truncate max-w-[calc(100%-28px)]">
          {{ game.name || t('game.gameNameUndefined') }}
        </h3>

        <HeartIconSVG
          v-if="user"
          :color="heartIconColor"
          class="flex-shrink-0 cursor-pointer"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        />
      </div>
    </div>
  </div>
</template>
