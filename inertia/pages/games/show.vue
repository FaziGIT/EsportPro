<script setup lang="ts">
import { computed, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import Layout from '~/components/layouts/layout.vue'
import { DateTime } from 'luxon'
import imageNotFound from '~/img/Image-not-found.png'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { useGameData } from '../../../resources/js/composables/usePageProps'
import { useAuth } from '../../../resources/js/composables/useAuth'
import GameForm from '~/components/GameForm.vue'
import { GameStatus } from '#types/game'
import { useFavoriteToggle } from '../../../resources/js/composables/useFavoriteToggle'
import { UserRole } from '#enums/user_role'

const { t } = useI18n()
const { user } = useAuth()
const { game, tournaments } = useGameData()

const isAdmin = computed(() => {
  return user.value?.role === UserRole.Admin
})

// Gestion des favoris
const { isFavorite, toggleFavorite } = useFavoriteToggle(
  game.value?.id || '',
  computed(() => game.value?.favoriteOfUsers as any[]),
  user.value?.id
)

// Modal state
const isEditModalOpen = ref(false)

interface Tournament {
  id: string
  name: string
  format: string
  price: number
  tier: string
  numberParticipants: number
  startDate: DateTime | string | Date
  endDate: DateTime | string | Date
}

const imageSource = computed(() => {
  if (game.value?.id) {
    return `/games/${game.value.id}/image`
  }
  return imageNotFound
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}

const handleTournamentImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}

const goToTournament = (tournamentId: string) => {
  router.visit(`/tournaments/${tournamentId}`)
}

const isTournamentFinished = (tournament: Tournament): boolean => {
  try {
    const endDate = DateTime.fromISO(String(tournament.endDate))
    return DateTime.now() > endDate
  } catch (error) {
    return false
  }
}

const isTournamentStarted = (tournament: Tournament): boolean => {
  try {
    const startDate = DateTime.fromISO(String(tournament.startDate))
    return DateTime.now() >= startDate && !isTournamentFinished(tournament)
  } catch (error) {
    return false
  }
}

const formatDate = (date: DateTime | string | Date): string => {
  try {
    const dateTime = DateTime.fromISO(String(date))
    return dateTime.toFormat('dd/MM/yyyy HH:mm')
  } catch (error) {
    return 'N/A'
  }
}

// Statistics computed properties
const activeTournamentsCount = computed(() => {
  return (
    tournaments.value?.filter(
      (tournament: Tournament) =>
        isTournamentStarted(tournament) && !isTournamentFinished(tournament)
    ).length || 0
  )
})

const upcomingTournamentsCount = computed(() => {
  return (
    tournaments.value?.filter(
      (tournament: Tournament) =>
        !isTournamentStarted(tournament) && !isTournamentFinished(tournament)
    ).length || 0
  )
})

const finishedTournamentsCount = computed(() => {
  return (
    tournaments.value?.filter((tournament: Tournament) => isTournamentFinished(tournament))
      .length || 0
  )
})

// Modal functions
const navigateToEdit = () => {
  if (!isAdmin.value) {
    return
  }
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}
</script>
<template>
  <Layout>
    <div class="px-4 sm:px-6 py-6">
      <!-- Header with title -->
      <div class="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
          {{ game.name }}
        </h1>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center w-full sm:w-auto">
          <!-- Favorite button (visible only when user is logged in) -->
          <button
            v-if="user"
            @click="toggleFavorite"
            class="font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto cursor-pointer"
            :class="
              isFavorite
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            "
          >
            <svg
              class="w-6 h-6"
              fill="currentColor"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="hidden sm:inline">{{
              isFavorite ? t('game.removeFromFavorites') : t('game.addToFavorites')
            }}</span>
          </button>

          <button
            v-if="isAdmin"
            @click="navigateToEdit"
            class="font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto cursor-pointer"
          >
            <svg
              class="w-4 h-4"
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
            <span class="hidden sm:inline">{{ t('game.editGame') }}</span>
            <span class="sm:hidden">{{ t('game.editGame') }}</span>
          </button>
        </div>
      </div>

      <!-- Game image -->
      <div
        class="bg-gray-100 h-64 flex items-center justify-center rounded-lg mb-6 overflow-hidden"
      >
        <div class="flex flex-col items-center justify-center text-gray-500">
          <img
            :src="imageSource"
            alt="Game Image"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Game details and tournaments -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <!-- Main content - Tournaments list -->
        <div class="xl:col-span-3">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-900">
                {{ t('game.tournaments') }}
              </h2>
              <span class="text-sm text-gray-500">
                {{ tournaments.length }} {{ t('game.tournamentsFound') }}
              </span>
            </div>

            <!-- Show message when no tournaments exist -->
            <div v-if="tournaments.length === 0" class="text-center py-12">
              <div class="text-gray-500 mb-4">
                <svg
                  class="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ t('game.noTournamentsYet') }}
              </h3>
              <p class="text-gray-600">{{ t('game.noTournamentsDescription') }}</p>
            </div>

            <!-- Show tournaments grid when tournaments exist -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="tournament in tournaments as Tournament[]"
                :key="tournament.id"
                class="relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                @click="goToTournament(tournament.id)"
              >
                <!-- Tournament status banner -->
                <div
                  v-if="isTournamentFinished(tournament)"
                  class="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs font-medium text-center py-1 z-10"
                >
                  {{ t('game.tournamentFinished') }}
                </div>
                <div
                  v-else-if="isTournamentStarted(tournament)"
                  class="absolute top-0 left-0 right-0 bg-green-500 text-white text-xs font-medium text-center py-1 z-10"
                >
                  {{ t('game.tournamentInProgress') }}
                </div>
                <div
                  v-else
                  class="absolute top-0 left-0 right-0 bg-blue-500 text-white text-xs font-medium text-center py-1 z-10"
                >
                  {{ t('game.tournamentUpcoming') }}
                </div>

                <!-- Tournament image -->
                <div class="h-40 bg-gray-200 flex items-center justify-center">
                  <img
                    :src="`/tournaments/${tournament.id}/image`"
                    :alt="tournament.name"
                    class="w-full h-full object-cover"
                    @error="handleTournamentImageError"
                  />
                </div>

                <!-- Tournament content -->
                <div
                  class="p-4"
                  :class="{
                    'pt-6': isTournamentFinished(tournament) || isTournamentStarted(tournament),
                  }"
                >
                  <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {{ tournament.name }}
                  </h3>

                  <div class="space-y-1 text-sm text-gray-600 mb-3">
                    <div class="flex justify-between">
                      <span>{{ t('tournament.format') }}:</span>
                      <span class="font-medium">{{ tournament.format }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>{{ t('tournament.prize') }}:</span>
                      <span class="font-medium">{{ tournament.price }}€</span>
                    </div>
                    <div class="flex justify-between">
                      <span>{{ t('tournament.tier') }}:</span>
                      <span class="font-medium">{{ tournament.tier }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>{{ t('tournament.participants') }}:</span>
                      <span class="font-medium">{{ tournament.numberParticipants }}</span>
                    </div>
                  </div>

                  <!-- Tournament dates -->
                  <div class="text-xs text-gray-500 border-t pt-2">
                    <div class="flex justify-between items-center">
                      <span>{{ t('tournament.startDate') }}:</span>
                      <span>{{ formatDate(tournament.startDate) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>{{ t('tournament.endDate') }}:</span>
                      <span>{{ formatDate(tournament.endDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar with game info -->
        <div class="xl:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('game.gameDetails') }}</h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('game.gameName') }}:</span>
                <span class="font-medium text-gray-900">{{ game.name }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('game.platform') }}:</span>
                <span class="font-medium text-gray-900">{{ game.platform }}</span>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{{ t('game.statistics') }}</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ t('game.totalTournaments') }}:</span>
                    <span class="font-medium">{{ tournaments.length }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ t('game.activeTournaments') }}:</span>
                    <span class="font-medium">{{ activeTournamentsCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ t('game.upcomingTournaments') }}:</span>
                    <span class="font-medium">{{ upcomingTournamentsCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ t('game.finishedTournaments') }}:</span>
                    <span class="font-medium">{{ finishedTournamentsCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Edit Modal -->
    <GameForm
      v-if="isAdmin"
      :isOpen="isEditModalOpen"
      :mode="GameStatus.EDIT"
      :game="game as any"
      @close="closeEditModal"
    />
  </Layout>
</template>

<style scoped>
.hover\:shadow-lg:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
