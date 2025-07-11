<template>
  <Layout>
    <div class="px-6 py-6">
      <!-- Header with title -->
      <div class="flex justify-between items-start mb-6">
        <h1 class="text-4xl font-semibold text-gray-900">{{ game.name }}</h1>
        <div class="text-lg font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
          {{ game.platform }}
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
                v-for="tournament in tournaments"
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
                    @error="(e) => handleTournamentImageError(e, tournament)"
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
                      <span class="font-medium">{{ formatTier(tournament.tier) }}</span>
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
                <span class="font-medium text-gray-900">{{ formatPlatform(game.platform) }}</span>
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
  </Layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import Layout from '~/components/layouts/layout.vue'
import { DateTime } from 'luxon'
import imageNotFound from '~/img/Image-not-found.png'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { GamePlatform } from '#enums/game_platform'

const { t } = useI18n()

interface Game {
  id: string
  name: string
  platform: GamePlatform
}

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

const { props } = usePage()
const game = props.game as Game
const tournaments = props.tournaments as Tournament[]

const imageSource = computed(() => {
  if (game.id) {
    return `/games/${game.id}/image`
  }
  return imageNotFound
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = imageNotFound
  }
}

const handleTournamentImageError = (event: Event, tournament: Tournament) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = imageNotFound
  }
}

const goToTournament = (tournamentId: string) => {
  router.visit(`/tournaments/${tournamentId}`)
}

const isTournamentFinished = (tournament: Tournament): boolean => {
  try {
    let endDate: DateTime
    if (tournament.endDate instanceof DateTime) {
      endDate = tournament.endDate
    } else if (typeof tournament.endDate === 'string') {
      endDate = DateTime.fromISO(tournament.endDate)
    } else if (tournament.endDate instanceof Date) {
      endDate = DateTime.fromJSDate(tournament.endDate)
    } else {
      return false
    }
    return DateTime.now() > endDate
  } catch (error) {
    return false
  }
}

const isTournamentStarted = (tournament: Tournament): boolean => {
  try {
    let startDate: DateTime
    if (tournament.startDate instanceof DateTime) {
      startDate = tournament.startDate
    } else if (typeof tournament.startDate === 'string') {
      startDate = DateTime.fromISO(tournament.startDate)
    } else if (tournament.startDate instanceof Date) {
      startDate = DateTime.fromJSDate(tournament.startDate)
    } else {
      return false
    }
    return DateTime.now() >= startDate && !isTournamentFinished(tournament)
  } catch (error) {
    return false
  }
}

const formatDate = (date: DateTime | string | Date): string => {
  try {
    let dateTime: DateTime
    if (date instanceof DateTime) {
      dateTime = date
    } else if (typeof date === 'string') {
      dateTime = DateTime.fromISO(date)
    } else if (date instanceof Date) {
      dateTime = DateTime.fromJSDate(date)
    } else {
      return 'N/A'
    }
    return dateTime.toFormat('dd/MM/yyyy HH:mm')
  } catch (error) {
    return 'N/A'
  }
}

const formatTier = (tier: string): string => {
  const tierMap: { [key: string]: string } = {
    beginner: t('tournament.beginners'),
    intermediate: t('tournament.intermediate'),
    advanced: t('tournament.advanced'),
    pro: t('tournament.professional'),
  }
  return tierMap[tier] || tier
}

const formatPlatform = (platform: GamePlatform): string => {
  const platformMap: { [key: string]: string } = {
    PC: 'PC',
    PS4: 'PlayStation 4',
    PS5: 'PlayStation 5',
    XBOX: 'Xbox',
    SWITCH: 'Nintendo Switch',
  }
  return platformMap[platform] || platform
}

// Statistics computed properties
const activeTournamentsCount = computed(() => {
  return tournaments.filter(
    (tournament) => isTournamentStarted(tournament) && !isTournamentFinished(tournament)
  ).length
})

const upcomingTournamentsCount = computed(() => {
  return tournaments.filter(
    (tournament) => !isTournamentStarted(tournament) && !isTournamentFinished(tournament)
  ).length
})

const finishedTournamentsCount = computed(() => {
  return tournaments.filter((tournament) => isTournamentFinished(tournament)).length
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover\:shadow-lg:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
