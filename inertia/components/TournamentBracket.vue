<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-900 mb-6">Tournament Bracket</h2>

    <div v-if="teams.length === 0" class="text-center py-8 text-gray-500">
      <p class="text-lg">No teams registered yet</p>
      <p class="text-sm mt-2">Bracket will appear once teams join</p>
    </div>

    <div v-else class="flex justify-between items-center gap-4 overflow-x-auto p-2 min-h-[400px]">
      <!-- Dynamic Rounds -->
      <div
        v-for="(round, roundIndex) in bracketRounds"
        :key="`round-${roundIndex}`"
        class="flex-1 min-w-[180px] max-w-[220px]"
      >
        <h3 class="text-lg font-semibold text-gray-700 mb-4 text-center">
          {{ getRoundName(roundIndex, bracketRounds.length) }}
        </h3>
        <div class="flex flex-col gap-3">
          <div
            v-for="(match, matchIndex) in round"
            :key="`round${roundIndex}-match${matchIndex}`"
            :class="[
              'bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden min-h-[70px] transition-all duration-200',
              roundIndex === bracketRounds.length - 1 ? 'border-yellow-400 min-h-[90px]' : '',
              isTeamHighlighted(match.team1) || isTeamHighlighted(match.team2)
                ? 'ring-1 ring-blue-300 ring-opacity-30'
                : '',
              canEditMatch(match)
                ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50'
                : '',
            ]"
            @click="openScoreModal(match)"
          >
            <div
              :class="[
                'flex justify-between items-center p-3 border-b border-gray-200 transition-all duration-200 cursor-pointer hover:bg-gray-100',
                'last:border-b-0',
                isTeamHighlighted(match.team1) ? 'border-l-4 border-l-blue-500' : '',
                isLosingTeam(match.team1) ? 'opacity-30' : '',
                isWinner(match.team1, match) ? 'font-bold text-green-700 bg-green-50' : '',
                isLoser(match.team1, match) ? 'text-gray-500 line-through opacity-75' : '',
              ]"
              @mouseenter="hoveredTeam = match.team1 || null"
              @mouseleave="hoveredTeam = null"
            >
              <span class="font-medium text-gray-700 flex-1">
                {{ getTeamDisplayName(match.team1, 'team1', match) }}
              </span>
              <span
                v-if="roundIndex === bracketRounds.length - 1 && isWinner(match.team1, match)"
                class="text-xl mr-2"
                >🏆</span
              >
              <span
                v-if="match.scoreTeam1 !== null"
                class="bg-gray-600 text-white px-2 py-1 rounded text-sm font-bold min-w-[30px] text-center"
                >{{ match.scoreTeam1 }}</span
              >
            </div>
            <div
              :class="[
                'flex justify-between items-center p-3 transition-all duration-200 cursor-pointer hover:bg-gray-100',
                isTeamHighlighted(match.team2) ? 'border-l-4 border-l-blue-500' : '',
                isLosingTeam(match.team2) ? 'opacity-30' : '',
                isWinner(match.team2, match) ? 'font-bold text-green-700 bg-green-50' : '',
                isLoser(match.team2, match) ? 'text-gray-500 line-through opacity-75' : '',
                !match.team2 ? 'bg-gray-100 opacity-60' : '', // Style for BYE
              ]"
              @mouseenter="hoveredTeam = match.team2 || null"
              @mouseleave="hoveredTeam = null"
            >
              <span class="font-medium text-gray-700 flex-1">
                {{ getTeamDisplayName(match.team2, 'team2', match) }}
              </span>
              <span
                v-if="roundIndex === bracketRounds.length - 1 && isWinner(match.team2, match)"
                class="text-xl mr-2"
                >🏆</span
              >
              <span
                v-if="match.scoreTeam2 !== null"
                class="bg-gray-600 text-white px-2 py-1 rounded text-sm font-bold min-w-[30px] text-center"
                >{{ match.scoreTeam2 }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Match Score Update Modal -->
    <MatchScoreModal
      :isOpen="showScoreModal"
      :match="selectedMatch"
      :tournament="tournament"
      @close="closeScoreModal"
      @updated="handleScoreUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MatchScoreModal from './MatchScoreModal.vue'
import Team from '#models/team'
import Match from '#models/match'
import Tournament from '#models/tournament'
import User from '#models/user'

interface Props {
  teams: Team[]
  matches: Match[]
  tournament: Tournament
  user?: User | null
  isAdmin?: boolean
}

const props = defineProps<Props>()

const hoveredTeam = ref<Team | null>(null)
const showScoreModal = ref(false)
const selectedMatch = ref<Match | null>(null)

// Check if user can edit match scores
const canEditScores = computed(() => {
  if (!props.user || !props.tournament.isStarted) return false

  // Admin can always edit
  if (props.isAdmin) return true

  // Tournament creator can edit
  if (props.tournament.creator?.id === props.user.id) return true

  return false
})

// Check if tournament has started
const tournamentStarted = computed(() => {
  // Tournament is only considered started when explicitly marked as started
  return props.tournament.isStarted || false
})

// Generate bracket structure based on tournament state
const bracketRounds = computed(() => {
  // If tournament hasn't been started yet, show TBD placeholder bracket
  if (!tournamentStarted.value) {
    // Use the actual number of teams registered, not the maximum participants
    const actualParticipants =
      props.teams.length > 0 ? props.teams.length : props.tournament.numberParticipants
    return generateTBDBracket(actualParticipants)
  }

  // If tournament has been started, organize real matches by rounds
  if (tournamentStarted.value && props.matches.length > 0) {
    return generateBracketFromRealMatches(props.matches)
  }

  // If tournament started but no matches yet, show TBD
  const actualParticipants =
    props.teams.length > 0 ? props.teams.length : props.tournament.numberParticipants
  return generateTBDBracket(actualParticipants)
})

// Generate TBD bracket structure (before tournament starts)
const generateTBDBracket = (participants: number): Match[][] => {
  const rounds: Match[][] = []

  // For a proper single elimination tournament, we need to calculate the correct bracket size
  // The bracket should accommodate the number of participants, using powers of 2
  let bracketSize = 1
  while (bracketSize < participants) {
    bracketSize *= 2
  }

  let currentRoundSize = bracketSize

  while (currentRoundSize > 1) {
    const roundMatches: Match[] = []
    const matchesInRound = currentRoundSize / 2

    for (let i = 0; i < matchesInRound; i++) {
      const match: Match = {
        id: `tbd-${rounds.length}-${i}`,
        team1: undefined, // Will show as "TBD"
        team2: undefined, // Will show as "TBD"
        winner: undefined,
        scoreTeam1: null,
        scoreTeam2: null,
        tournamentId: props.tournament.id,
      }
      roundMatches.push(match)
    }

    rounds.push(roundMatches)
    currentRoundSize = currentRoundSize / 2
  }

  return rounds
}

// Generate bracket from real matches using nextMatchId relationships
const generateBracketFromRealMatches = (matches: Match[]): Match[][] => {
  if (matches.length === 0) return []

  // Create a map for quick match lookup
  const matchMap = new Map(matches.map((match) => [match.id, match]))

  // Find matches that don't have any match pointing to them (first round)
  const firstRoundMatches = matches.filter(
    (match) => !matches.some((otherMatch) => otherMatch.nextMatchId === match.id)
  )

  if (firstRoundMatches.length === 0) return []

  const rounds: Match[][] = []
  let currentRound = firstRoundMatches

  // Build rounds by following nextMatchId relationships
  while (currentRound.length > 0) {
    rounds.push([...currentRound])

    // Get unique next matches for this round
    const nextMatchIds = new Set(
      currentRound.map((match) => match.nextMatchId).filter((id) => id !== null && id !== undefined)
    )

    if (nextMatchIds.size === 0) break

    // Get the actual next matches
    currentRound = Array.from(nextMatchIds)
      .map((id) => matchMap.get(id!))
      .filter((match) => match !== undefined) as Match[]
  }

  return rounds
}

const isTeamHighlighted = (team: Team | undefined): boolean => {
  if (!hoveredTeam.value || !team) return false
  return hoveredTeam.value.id === team.id
}

const isLosingTeam = (team: Team | undefined): boolean => {
  if (!hoveredTeam.value || !team) return false
  return hoveredTeam.value.id !== team.id
}

const isWinner = (team: Team | undefined, match: Match): boolean => {
  if (!team || !match) return false
  return Boolean(match.winner && match.winner.id === team.id)
}

const isLoser = (team: Team | undefined, match: Match): boolean => {
  if (!team || !match) return false
  // A team is a loser if it's not the winner and the match has a winner
  return Boolean(match.winner && match.winner.id !== team.id)
}

const getRoundName = (roundIndex: number, totalRounds: number): string => {
  // Determine round names based on total rounds
  if (totalRounds === 1) return 'Final'

  if (totalRounds === 2) {
    return roundIndex === 0 ? 'Semi Finals' : 'Final'
  }

  if (totalRounds === 3) {
    return roundIndex === 0 ? 'Quarter Finals' : roundIndex === 1 ? 'Semi Finals' : 'Final'
  }

  if (totalRounds === 4) {
    return roundIndex === 0
      ? 'Round of 16'
      : roundIndex === 1
        ? 'Quarter Finals'
        : roundIndex === 2
          ? 'Semi Finals'
          : 'Final'
  }

  // For more rounds, use generic naming from the end
  if (roundIndex === totalRounds - 1) return 'Final'
  if (roundIndex === totalRounds - 2) return 'Semi Finals'
  if (roundIndex === totalRounds - 3) return 'Quarter Finals'
  if (roundIndex === totalRounds - 4) return 'Round of 16'

  return `Round ${roundIndex + 1}`
}

const getTeamDisplayName = (
  team: Team | undefined,
  type: 'team1' | 'team2',
  match: Match
): string => {
  // If tournament hasn't started, everything is TBD
  if (!tournamentStarted.value) {
    return 'TBD'
  }

  // If tournament has started
  if (team) {
    return team.name
  }

  // If team is null/undefined after tournament started
  // For finals (no nextMatchId), always show TBD for missing teams
  if (!match.nextMatchId) {
    return 'TBD'
  }

  // For non-final matches: team1 should be TBD if missing, team2 can be BYE for bye matches
  return type === 'team2' ? 'BYE' : 'TBD'
}

const openScoreModal = (match: Match) => {
  // Only allow editing for real matches with actual teams and if authorized
  if (
    !canEditScores.value ||
    !match.id ||
    match.id.startsWith('tbd-') ||
    match.id.startsWith('future-')
  ) {
    return
  }

  // Only allow editing matches that have teams and are not already completed
  if (!match.team1 || (!match.team2 && match.team2 !== null)) {
    return
  }

  selectedMatch.value = match
  showScoreModal.value = true
}

const closeScoreModal = () => {
  showScoreModal.value = false
  selectedMatch.value = null
}

const canEditMatch = (match: Match): boolean => {
  if (!canEditScores.value) return false
  if (!match.id || match.id.startsWith('tbd-') || match.id.startsWith('future-')) return false

  // Must have team1, and either team2 or be a bye match (team2 = null)
  if (!match.team1) return false
  if (match.team2 === undefined) return false // undefined means TBD, null means BYE

  return true
}

const handleScoreUpdated = (data: any) => {
  // Emit event to parent to refresh data
  emit('matchUpdated', data)
}

const emit = defineEmits<{
  matchUpdated: [data: any]
}>()
</script>
