<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from '../../resources/js/composables/useI18n'
import { getCsrfToken } from '~/utils'

const { t } = useI18n()

interface Team {
  id: string
  name: string
  isWinner?: boolean
  players?: {
    id: string
    email: string
    pseudo?: string
  }[]
}

interface Match {
  id: string
  team1?: Team
  team2?: Team
  winner?: Team
  scoreTeam1: number | null
  scoreTeam2: number | null
  tournamentId: string
  nextMatchId?: string | null
}

interface Tournament {
  id: string
  format: string
  isStarted: boolean
}

interface Props {
  isOpen: boolean
  match: Match | null
  tournament: Tournament
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: [data: any]
}>()

const team1Score = ref(0)
const team2Score = ref(0)
const isSubmitting = ref(false)

// Calculate max score based on tournament format
const maxScore = computed(() => {
  switch (props.tournament.format) {
    case 'BO1':
      return 1
    case 'BO3':
      return 2 // First to 2 wins
    case 'BO5':
      return 3 // First to 3 wins
    default:
      return 1
  }
})

// Check if the current score is valid
const isValidScore = computed(() => {
  if (!props.match) return false

  // For BYE matches, team1 should automatically win with max score
  if (props.match.team2 === null) {
    return team1Score.value === maxScore.value && team2Score.value === 0
  }

  // For normal matches, one team must reach max score and the other must be less
  const hasWinner = team1Score.value === maxScore.value || team2Score.value === maxScore.value
  const scoresAreDifferent = team1Score.value !== team2Score.value
  const winnerHasMaxScore =
    (team1Score.value === maxScore.value && team2Score.value < maxScore.value) ||
    (team2Score.value === maxScore.value && team1Score.value < maxScore.value)

  return hasWinner && scoresAreDifferent && winnerHasMaxScore
})

// Watch for match changes and reset scores
watch(() => props.match, (newMatch) => {
  if (newMatch) {
    team1Score.value = newMatch.scoreTeam1 ?? 0
    team2Score.value = newMatch.scoreTeam2 ?? 0

    // For BYE matches, set default scores
    if (newMatch.team2 === null) {
      team1Score.value = maxScore.value
      team2Score.value = 0
    }
  }
}, { immediate: true })

const getTeamDisplayName = (team: Team | undefined, type: 'team1' | 'team2'): string => {
  if (team) {
    return team.name
  }
  return type === 'team2' ? 'BYE' : 'TBD'
}

const closeModal = () => {
  emit('close')
}

const submitScore = async () => {
  if (!props.match || !isValidScore.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Get CSRF token using the same utility as other components
    const token = getCsrfToken()

    const response = await fetch(`/tournaments/${props.tournament.id}/matches/${props.match.id}/score`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || '',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        scoreTeam1: team1Score.value,
        scoreTeam2: team2Score.value
      })
    })

    if (response.ok) {
      const data = await response.json()
      // Success - emit updated data to parent like join tournament does
      emit('updated', data)
      closeModal()
    } else {
      const errorData = await response.json()
      alert(errorData.error || 'Failed to update match score')
    }
  } catch (error) {
    alert('Error updating match score')
  } finally {
    isSubmitting.value = false
  }
}
</script>
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-200"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-gray-900">{{ t('tournament.updateMatchScore') }}</h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitScore" v-if="match">
        <!-- Team 1 Score -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ getTeamDisplayName(match.team1, 'team1') }}
          </label>
          <input
            v-model.number="team1Score"
            type="number"
            min="0"
            :max="maxScore"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6B7B0] focus:border-[#D6B7B0] transition-all"
            :placeholder="t('tournament.score')"
            required
          />
        </div>

        <!-- Team 2 Score -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ getTeamDisplayName(match.team2, 'team2') }}
          </label>
          <input
            v-model.number="team2Score"
            type="number"
            min="0"
            :max="maxScore"
            :disabled="match.team2 === null"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6B7B0] focus:border-[#D6B7B0] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            :placeholder="match.team2 === null ? 'BYE' : t('tournament.score')"
            :required="match.team2 !== null"
          />
        </div>

        <!-- Format Info -->
        <div class="mb-6 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">
            <span class="font-medium">{{ t('tournament.format') }}:</span> {{ tournament.format }}
            <br />
            <span class="font-medium">{{ t('tournament.firstTo') }}:</span> {{ maxScore }} {{ t('tournament.wins') }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !isValidScore"
            class="px-4 py-2 bg-[#5C4741] text-white rounded-lg hover:bg-[#7B5F57] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? t('tournament.updating') : t('tournament.updateScore') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
