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
              isTeamHighlighted(match.team1) || isTeamHighlighted(match.team2) ? 'ring-1 ring-blue-300 ring-opacity-30' : ''
            ]"
          >
            <div 
              :class="[
                'flex justify-between items-center p-3 border-b border-gray-200 transition-all duration-200 cursor-pointer hover:bg-gray-100',
                'last:border-b-0',
                isTeamHighlighted(match.team1) ? 'border-l-4 border-l-blue-500' : '',
                isLosingTeam(match.team1) ? 'opacity-30' : '',
                isWinner(match.team1, match) ? 'font-bold text-green-700 bg-green-50' : '',
                isLoser(match.team1, match) ? 'text-gray-500 line-through opacity-75' : ''
              ]"
              @mouseenter="hoveredTeam = match.team1 || null"
              @mouseleave="hoveredTeam = null"
            >
              <span class="font-medium text-gray-700 flex-1">
                {{ match.team1?.name || 'TBD' }}
              </span>
              <span v-if="roundIndex === bracketRounds.length - 1 && isWinner(match.team1, match)" class="text-xl mr-2">🏆</span>
              <span v-if="match.scoreTeam1 !== null" class="bg-gray-600 text-white px-2 py-1 rounded text-sm font-bold min-w-[30px] text-center">{{ match.scoreTeam1 }}</span>
            </div>
            <div 
              :class="[
                'flex justify-between items-center p-3 transition-all duration-200 cursor-pointer hover:bg-gray-100',
                isTeamHighlighted(match.team2) ? 'border-l-4 border-l-blue-500' : '',
                isLosingTeam(match.team2) ? 'opacity-30' : '',
                isWinner(match.team2, match) ? 'font-bold text-green-700 bg-green-50' : '',
                isLoser(match.team2, match) ? 'text-gray-500 line-through opacity-75' : ''
              ]"
              @mouseenter="hoveredTeam = match.team2 || null"
              @mouseleave="hoveredTeam = null"
            >
              <span class="font-medium text-gray-700 flex-1">
                {{ match.team2?.name || 'TBD' }}
              </span>
              <span v-if="roundIndex === bracketRounds.length - 1 && isWinner(match.team2, match)" class="text-xl mr-2">🏆</span>
              <span v-if="match.scoreTeam2 !== null" class="bg-gray-600 text-white px-2 py-1 rounded text-sm font-bold min-w-[30px] text-center">{{ match.scoreTeam2 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Team {
  id: string
  name: string
  isWinner?: boolean
}

interface Match {
  id: string
  team1?: Team
  team2?: Team
  winner?: Team
  scoreTeam1: number | null
  scoreTeam2: number | null
  tournamentId: string
}

interface Tournament {
  id: string
  numberParticipants: number
  startDate: string | Date | any // Accept DateTime from Luxon
}

interface Props {
  teams: Team[]
  matches: Match[]
  tournament: Tournament
}

const props = defineProps<Props>()

const hoveredTeam = ref<Team | null>(null)

// Check if tournament has started
const tournamentStarted = computed(() => {
  if (!props.tournament.startDate) return false
  
  try {
    const startDate = new Date(props.tournament.startDate)
    return new Date() >= startDate
  } catch (error) {
    return false
  }
})

// Generate bracket structure based on tournament participants or real matches
const bracketRounds = computed(() => {
  // If tournament hasn't started, generate empty bracket based on participants
  if (!tournamentStarted.value) {
    return generateEmptyBracket(props.tournament.numberParticipants)
  }
  
  // If tournament has started but no matches, generate empty bracket
  if (props.matches.length === 0) {
    return generateEmptyBracket(props.tournament.numberParticipants)
  }
  
  // Use real matches if tournament has started and has matches
  return generateBracketFromMatches(props.matches)
})

// Generate empty bracket structure based on number of participants
const generateEmptyBracket = (participants: number): Match[][] => {
  const rounds: Match[][] = []
  let currentRoundSize = participants
  
  while (currentRoundSize > 1) {
    const roundMatches: Match[] = []
    
    for (let i = 0; i < currentRoundSize; i += 2) {
      const match: Match = {
        id: `empty-${rounds.length}-${i}`,
        team1: undefined,
        team2: undefined,
        winner: undefined,
        scoreTeam1: null,
        scoreTeam2: null,
        tournamentId: props.tournament.id
      }
      roundMatches.push(match)
    }
    
    rounds.push(roundMatches)
    currentRoundSize = Math.ceil(currentRoundSize / 2)
  }
  
  return rounds
}

// Generate bracket from real matches
const generateBracketFromMatches = (matches: Match[]): Match[][] => {
  const rounds: Match[][] = []
  let currentMatches = [...matches]
  
  while (currentMatches.length > 0) {
    const roundMatches = currentMatches.slice(0, Math.ceil(currentMatches.length / 2))
    rounds.push(roundMatches)
    currentMatches = currentMatches.slice(Math.ceil(currentMatches.length / 2))
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
  if (totalRounds === 1) return 'Final'
  if (totalRounds === 2) {
    return roundIndex === 0 ? 'Semi Finals' : 'Final'
  }
  if (totalRounds === 3) {
    return roundIndex === 0 ? 'Quarter Finals' : roundIndex === 1 ? 'Semi Finals' : 'Final'
  }
  
  // For more rounds, use generic naming
  if (roundIndex === totalRounds - 1) return 'Final'
  if (roundIndex === totalRounds - 2) return 'Semi Finals'
  if (roundIndex === totalRounds - 3) return 'Quarter Finals'
  
  return `Round ${roundIndex + 1}`
}
</script> 