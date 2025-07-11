<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { computed, defineProps, ref } from 'vue'
import HeartIconSVG from '~/components/icons/HeartIconSVG.vue'
import { useI18n } from '../../resources/js/composables/useI18n'
import User from '#models/user'
import { router, usePage } from '@inertiajs/vue3'
import Game from '#models/game'
import { GamePlatform } from '#enums/game_platform'
import { getCsrfToken } from '~/utils'

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

const page = usePage()
const userProps = computed(() => page.props.user as User)
const isFavorite = ref(
  props.game?.favoriteOfUsers?.some((user: User) => user.id === userProps.value?.id)
)

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}

const goToGame = () => {
  if (props.game?.id) {
    router.visit(`/games/${props.game.id}`)
  }
}

const formatPlatform = (platform: GamePlatform): string => platform.toString()

const toggleFavorite = async () => {
  try {
    const response = await fetch(`/games/${props.game.id}/toggle-favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
    })

    if (response.ok) {
      isFavorite.value = !isFavorite.value
      playHeartAnimation()
      router.reload({ only: ['userGames'] })
    }
  } catch (error) {
    console.error('Erreur toggle favorite:', error)
  }
}

const heartRef = ref<HTMLElement>()

const playHeartAnimation = () => {
  if (!heartRef.value) return

  heartRef.value.classList.add('heart-sparkle-animation')

  setTimeout(() => {
    if (heartRef.value) {
      heartRef.value.classList.remove('heart-sparkle-animation')
    }
  }, 800)
}
</script>

<template>
  <div
    class="flex flex-col w-60 h-60 min-w-40 rounded-xl shadow-md bg-white overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
    @click="goToGame"
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
      <div class="flex items-start justify-between">
        <div class="flex-1 mr-3 py-1 gap-2 flex flex-col">
          <h3 class="text-lg font-bold text-black truncate mb-1">
            {{
              game.name?.slice(0, 10) +
                (game.name?.length && game.name?.length > 10 ? '...' : '') ||
              t('game.gameNameUndefined')
            }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ formatPlatform(game.platform as GamePlatform) }}
          </p>
        </div>

        <div
          ref="heartRef"
          class="relative flex-shrink-0 cursor-pointer"
          @click.stop="toggleFavorite"
        >
          <HeartIconSVG
            v-if="userProps"
            :fill="isFavorite ? '#ff4757' : '#D6B7B0'"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation principale du cœur */
.heart-sparkle-animation {
  position: relative;
  z-index: 10;
}

/* Animation du cœur - bounce et glow */
.heart-sparkle-animation svg {
  animation: heartBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 0 8px rgba(255, 71, 87, 0.6));
}

/* Particules qui explosent autour du cœur */
.heart-sparkle-animation::before,
.heart-sparkle-animation::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #ff4757;
  border-radius: 50%;
  animation: sparkle 0.8s ease-out forwards;
  z-index: -1;
}

.heart-sparkle-animation::before {
  animation-delay: 0.1s;
  transform: translate(-50%, -50%) scale(0);
  box-shadow:
    -20px -20px 0 0 #ff6b7a,
    20px -20px 0 0 #ff6b7a,
    -20px 20px 0 0 #ff6b7a,
    20px 20px 0 0 #ff6b7a;
}

.heart-sparkle-animation::after {
  animation-delay: 0.2s;
  transform: translate(-50%, -50%) scale(0) rotate(45deg);
  box-shadow:
    -15px -15px 0 0 #ffb3ba,
    15px -15px 0 0 #ffb3ba,
    -15px 15px 0 0 #ffb3ba,
    15px 15px 0 0 #ffb3ba,
    0 -21px 0 0 #ffb3ba,
    0 21px 0 0 #ffb3ba,
    -21px 0 0 0 #ffb3ba,
    21px 0 0 0 #ffb3ba;
}

/* Keyframes pour le bounce du cœur */
@keyframes heartBounce {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3) rotate(-5deg);
  }
  50% {
    transform: scale(1.1) rotate(2deg);
  }
  75% {
    transform: scale(1.2) rotate(-1deg);
  }
  100% {
    transform: scale(1);
  }
}

/* Keyframes pour les particules */
@keyframes sparkle {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

/* Animation de hover pour le cœur */
.heart-sparkle-animation svg:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style>
