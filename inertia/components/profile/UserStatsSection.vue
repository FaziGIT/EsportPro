<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from '../../../resources/js/composables/useI18n'
import Tournament from '#models/tournament'

const { t } = useI18n()

// Interface pour les statistiques de jeu
interface GameStat {
  totalMatches: number
  wins: number
  totalHours: number
  gameName: string
}

const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  userTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
  finishedTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
  gameStats: {
    type: Object as () => Record<string, GameStat>,
    default: () => ({}),
  }
})

// Calculer les statistiques globales
const totalTournaments = computed(() => {
  return props.userTournaments.length + props.finishedTournaments.length
})

const finishedTournamentsCount = computed(() => {
  return props.finishedTournaments.length
})

const tournamentWinRate = computed(() => {
  if (finishedTournamentsCount.value === 0) return 0

  let wonTournaments = 0
  props.finishedTournaments.forEach(tournament => {
    if (tournament.winnerId) {
      // Trouver l'équipe de l'utilisateur
      const userTeam = tournament.teams?.find(team =>
        team.players?.some(player => player?.id === props.userId)
      )

      // Si l'équipe de l'utilisateur est l'équipe gagnante
      if (userTeam && tournament.winnerId === userTeam.id) {
        wonTournaments++
      }
    }
  })

  return Math.round((wonTournaments / finishedTournamentsCount.value) * 100)
})

const totalPlayTime = computed(() => {
  // Récupérer les valeurs de totalHours et les additionner
  const total = Object.values(props.gameStats)
    .reduce((sum, stat) => sum + (Number.isFinite(stat.totalHours) ? stat.totalHours : 0), 0);

  // Arrondir à une décimale
  return Math.round(total * 10) / 10;
})

// Formatter les nombres avec des espaces pour les milliers
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8 mb-8">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">{{ t('profile.myStats') }}</h2>
    </div>

    <div class="p-6">
      <!-- Statistiques globales -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-500">{{ t('profile.totalTournaments') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatNumber(totalTournaments) }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-500">{{ t('profile.tournamentWinRate') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ tournamentWinRate }}%</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-500">{{ t('profile.totalPlayTime') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatNumber(totalPlayTime) }}h</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-500">{{ t('profile.finishedTournaments') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatNumber(finishedTournamentsCount) }}</p>
        </div>
      </div>

      <!-- Statistiques par jeu -->
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ t('profile.statsByGame') }}</h3>

      <div v-if="Object.keys(gameStats).length === 0" class="text-center py-6 text-gray-500">
        {{ t('profile.noGameStats') }}
      </div>

      <div v-else class="space-y-4">
        <div v-for="(stats, gameId) in gameStats" :key="gameId" class="border rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="text-md font-medium text-gray-800">{{ stats.gameName || 'Jeu inconnu' }}</h4>
            <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {{ (Math.round((stats.totalHours || 0) * 10) / 10).toFixed(1) }}h
            </span>
          </div>

          <div class="flex items-center">
            <div class="flex-1">
              <div class="h-2 bg-gray-200 rounded-full">
                <div
                  class="h-2 bg-green-500 rounded-full"
                  :style="{width: `${(stats.totalMatches || 0) > 0 ? ((stats.wins || 0) / stats.totalMatches) * 100 : 0}%`}"
                ></div>
              </div>
            </div>
            <span class="ml-2 text-sm text-gray-700">
              {{ (stats.totalMatches || 0) > 0 ? Math.round(((stats.wins || 0) / stats.totalMatches) * 100) : 0 }}%
              ({{ stats.wins || 0 }}/{{ stats.totalMatches || 0 }})
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
