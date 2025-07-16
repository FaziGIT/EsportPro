<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { computed, defineProps, ref } from 'vue'
import HeartIconSVG from '~/components/icons/HeartIconSVG.vue'
import { useI18n } from '../../resources/js/composables/useI18n'
import { useAuth } from '../../resources/js/composables/useAuth'
import User from '#models/user'
import { router } from '@inertiajs/vue3'
import Game from '#models/game'
import { GamePlatform } from '#enums/game_platform'
import GameForm from './GameForm.vue'
import { GameStatus } from '#types/game'
import { useFavoriteToggle } from '../../resources/js/composables/useFavoriteToggle'
import { TrashIcon } from '~/components/icons'
import { getCsrfToken } from '~/utils'
import DeleteConfirmationModal from '~/components/DeleteConfirmationModal.vue'

const { t } = useI18n()
const { user: userProps, isAdmin } = useAuth()

const props = defineProps({
  game: {
    type: Object as () => Partial<Game>,
    required: true,
  },
  needReload: {
    type: Boolean,
    default: false,
  },
})

const imageSource = computed(() => {
  if (props.game?.id) {
    return `/games/${props.game?.id}/image`
  }

  return imageNotFound
})

const isHovered = ref(false)

// Utiliser le composable pour la gestion des favoris
const { isFavorite, toggleFavorite: toggleFavoriteBase } = useFavoriteToggle(
  props.game?.id || '',
  computed(() => props.game?.favoriteOfUsers as User[]),
  userProps.value?.id
)

// Modal state for game editing
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeletingGame = ref(false)
const deleteError = ref('')
const deleteSuccess = ref('')

const handleImageError = (event: Event) => {
  console.log('handleImageError')
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
  const success = await toggleFavoriteBase()
  if (success) {
    playHeartAnimation()
  }
}

const heartRef = ref<HTMLElement>()

const navigateToEdit = (event: Event) => {
  event.stopPropagation() // Prevent card click
  if (!props.game?.id) {
    console.error('Game ID is missing:', props.game)
    return
  }
  if (!isAdmin.value) {
    return
  }

  isEditModalOpen.value = true
}

const openDeleteModal = (event: Event) => {
  event.stopPropagation()
  if (!props.game?.id) {
    console.error('Game ID is missing:', props.game)
    return
  }
  if (!isAdmin.value) {
    return
  }
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deleteError.value = ''
  deleteSuccess.value = ''
}

const deleteGame = async () => {
  if (!props.game?.id || isDeletingGame.value) return

  isDeletingGame.value = true
  deleteError.value = ''

  try {
    const token = getCsrfToken()
    const response = await fetch(`/games/${props.game.id}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token || '',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      deleteError.value = result.message || 'Erreur lors de la suppression du jeu'
      return
    }

    // Suppression réussie
    deleteSuccess.value = result.message || 'Jeu supprimé avec succès'

    // Recharger la page après 2 secondes
    setTimeout(() => {
      router.reload()
    }, 2000)

  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'Une erreur est survenue'
  } finally {
    isDeletingGame.value = false
  }
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

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
    class="flex flex-col w-60 h-60 min-w-40 rounded-xl shadow-md bg-white overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
    @click="goToGame"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div v-if="isAdmin" class="absolute top-2 right-2 z-10 flex gap-2">
      <button
        @click="navigateToEdit"
        class="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
        :class="{ 'opacity-100': isHovered }"
      >
        <svg
          class="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          ></path>
        </svg>
      </button>

      <button
        @click="openDeleteModal"
        class="bg-white rounded-full p-2 shadow-md hover:bg-red-100 transition-colors duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
        :class="{ 'opacity-100': isHovered }"
      >
        <TrashIcon class="w-4 h-4 text-gray-600 hover:text-red-600" />
      </button>
    </div>

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

    <!-- Game Edit Modal -->
    <teleport to="body">
      <GameForm
        v-if="isAdmin"
        :isOpen="isEditModalOpen"
        :mode="GameStatus.EDIT"
        :game="props.game as Game"
        :need-reload="needReload"
        @close="closeEditModal"
      />
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <DeleteConfirmationModal
        :isOpen="isDeleteModalOpen"
        :title="t('common.confirmDelete')"
        :confirmMessage="t('game.confirmDeleteMessage')"
        :itemName="game?.name || ''"
        :warningMessage="t('game.deleteWarning')"
        :isDeleting="isDeletingGame"
        :error="deleteError"
        :success="deleteSuccess"
        :need-reload="needReload"
        @close="closeDeleteModal"
        @confirm="deleteGame"
      />
    </teleport>
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
