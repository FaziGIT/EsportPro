<template>
  <Layout>
    <div class="px-6 py-6">
      <!-- Header with title and join button -->
      <div class="flex justify-between items-start mb-6">
        <h1 class="text-4xl font-semibold text-gray-900">{{ tournament.name }}</h1>
        <button 
          v-if="!userHasJoined && !tournamentStarted" 
          @click="joinTournament" 
          class="font-semibold px-6 py-3 rounded-lg transition bg-[#5C4741] text-white hover:bg-[#7b5f57]"
        >
          Join Tournament
        </button>
      </div>

      <!-- Tournament image placeholder -->
      <div class="bg-gray-100 h-64 flex items-center justify-center rounded-lg mb-6">
        <div class="flex flex-col items-center justify-center text-gray-500">
          <img src="../img/Image-not-found.png" alt="Placeholder" class="w-16 h-16 mb-2" />
          <p class="text-sm">Tournament Image</p>
        </div>
      </div>
      
      <!-- Tournament details grid -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <!-- Main content -->
        <div class="xl:col-span-3">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Tournament Rules</h2>
            <p class="text-gray-700 leading-relaxed">{{ tournament.rules }}</p>
          </div>

          <!-- Teams section -->
          <div class="w-full overflow-hidden">
            <TournamentBracket :teams="teams" :matches="matches" :tournament="tournament" />
          </div>
        </div>

        <!-- Sidebar with tournament info -->
        <div class="xl:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Tournament Details</h2>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Format:</span>
                <span class="font-medium text-gray-900">{{ tournament.format }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Players per team:</span>
                <span class="font-medium text-gray-900">{{ tournament.numberPlayersPerTeam }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Entry fee:</span>
                <span class="font-medium text-gray-900">{{ tournament.price }}€</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Tier:</span>
                <span class="font-medium text-gray-900">{{ tournament.tier }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Region:</span>
                <span class="font-medium text-gray-900">{{ tournament.region }}</span>
              </div>
              
              <div class="pt-4 border-t border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">Location</h3>
                <p class="text-gray-700 text-sm">
                  {{ tournament.address }}<br>
                  {{ tournament.postalCode }} {{ tournament.city }}<br>
                  {{ tournament.country }}
                </p>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">Dates</h3>
                <p class="text-gray-700 text-sm">
                  <span class="font-medium">Start:</span> {{ formatDate(tournament.startDate) }}<br>
                  <span class="font-medium">End:</span> {{ formatDate(tournament.endDate) }}
                </p>
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
import { usePage } from '@inertiajs/vue3'
import Layout from '~/components/layouts/layout.vue'
import { DateTime } from 'luxon'
import TournamentBracket from '../../components/TournamentBracket.vue'

interface Tournament {
  id: string
  name: string
  format: string
  price: number
  rules: string
  numberPlayersPerTeam: number
  numberParticipants: number
  tier: string
  region: string
  address: string
  city: string
  country: string
  postalCode: string
  startDate: DateTime | string | Date
  endDate: DateTime | string | Date
}

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

const { props } = usePage()
const tournament = props.tournament as Tournament
const teams = props.teams as Team[]
const matches = props.matches as Match[]

const userHasJoined = computed(() => {
  // TODO: Implement user team check
  return false
})

const tournamentStarted = computed(() => {
  if (!tournament.startDate) return false
  
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
    
    return DateTime.now() >= startDate
  } catch (error) {
    console.error('Error checking tournament start date:', error)
    return false
  }
})

const joinTournament = () => {
  // TODO: Implement join tournament functionality
  console.log('Join tournament clicked')
}

const formatDate = (date: DateTime | string | Date | undefined): string => {
  if (!date) return 'Date not specified'
  
  try {
    if (date instanceof DateTime) {
      return date.toFormat('dd/MM/yyyy')
    }
    
    if (typeof date === 'string') {
      return DateTime.fromISO(date).toFormat('dd/MM/yyyy')
    }
    
    if (date instanceof Date) {
      return DateTime.fromJSDate(date).toFormat('dd/MM/yyyy')
    }
    
    return String(date)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Date not specified'
  }
}
</script>
