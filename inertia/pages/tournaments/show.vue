<template>
  <Layout>
    <div class="px-6 py-6">
      <!-- Success notification -->
      <div
        v-if="showSuccessMessage"
        class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
      >
        <div class="flex items-center">
          <span>{{ t('tournament.joinSuccess') }}</span>
          <button
            @click="showSuccessMessage = false"
            class="ml-auto text-green-500 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Header with title and join button -->
      <div class="flex justify-between items-start mb-6">
        <h1 class="text-4xl font-semibold text-gray-900">{{ tournament.name }}</h1>
        <button
          v-if="!userHasJoined && !tournamentStarted && user"
          @click="joinTournament"
          :disabled="isJoining"
          class="font-semibold px-6 py-3 rounded-lg transition bg-[#5C4741] text-white hover:bg-[#7b5f57] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isJoining ? t('tournament.joining') : t('tournament.join') }}
        </button>
        <button
          v-else-if="!user"
          @click="redirectToLogin"
          class="font-semibold px-6 py-3 rounded-lg transition bg-[#5C4741] text-white hover:bg-[#7b5f57]"
        >
          {{ t('tournament.loginToJoin') }}
        </button>
        <div
          v-else-if="userHasJoined"
          class="font-semibold px-6 py-3 rounded-lg bg-green-100 text-green-700"
        >
          {{ t('tournament.alreadyJoined') }}
        </div>
      </div>

      <!-- Tournament image placeholder -->
      <div
        class="bg-gray-100 h-64 flex items-center justify-center rounded-lg mb-6 overflow-hidden"
      >
        <div class="flex flex-col items-center justify-center text-gray-500">
          <img :src="imageSource" alt="Placeholder" class="w-full mb-2" @error="handleImageError" />
        </div>
      </div>

      <!-- Tournament details grid -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <!-- Main content -->
        <div class="xl:col-span-3">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ t('tournament.rules') }}</h2>
            <p class="text-gray-700 leading-relaxed">{{ tournament.rules }}</p>
          </div>

          <!-- Teams section -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">
              {{ t('tournament.registeredTeams') }}
            </h2>

            <!-- Show message when no teams have joined yet -->
            <div v-if="allTeams.length === 0" class="text-center py-8">
              <div class="text-gray-500 mb-4">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ t('tournament.noTeamsYet') }}
              </h3>
              <p class="text-gray-600">{{ t('tournament.beFirstToJoin') }}</p>
            </div>

            <!-- Show teams grid when teams exist -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="team in allTeams"
                :key="team.id"
                :data-team-id="team.id"
                :class="[
                  'border-2 rounded-lg p-4 transition-all duration-200',
                  isUserTeam(team)
                    ? 'bg-green-50 border-green-300 shadow-md'
                    : 'bg-gray-50 border-gray-200',
                  isUserTeam(team) && isEditingTeam(team) ? 'ring-2 ring-green-400' : '',
                ]"
              >
                <div class="flex items-center justify-between mb-3">
                  <div v-if="isUserTeam(team) && isEditingTeam(team)" class="flex-1 mr-2">
                    <input
                      v-model="editingTeamName"
                      @keyup.enter="saveTeamName(team)"
                      @blur="saveTeamName(team)"
                      class="w-full px-2 py-1 border border-green-400 rounded text-sm font-semibold"
                      placeholder="Team name"
                      ref="teamNameInput"
                    />
                  </div>
                  <h3 v-else class="font-semibold text-gray-900 flex-1 team-name">
                    {{ team.name }}
                    <button
                      v-if="isUserTeam(team)"
                      @click="startEditingTeam(team)"
                      class="ml-2 text-green-600 hover:text-green-800 text-sm"
                    >
                      ✏️
                    </button>
                  </h3>
                  <div
                    v-if="isUserTeam(team)"
                    class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                  >
                    {{ t('tournament.yourTeam') }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="player in team.players"
                    :key="player.id"
                    class="flex flex-col items-center"
                  >
                    <div
                      class="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                      :class="
                        player.id === user?.id
                          ? 'border-2 border-green-500 bg-white'
                          : 'bg-gray-300'
                      "
                    >
                      <span
                        :class="
                          player.id === user?.id ? 'text-green-600 font-bold' : 'text-gray-700'
                        "
                        class="text-sm font-medium"
                      >
                        {{ player.pseudo?.charAt(0) || player.email?.charAt(0) || '?' }}
                      </span>
                    </div>
                    <span
                      class="text-xs text-center max-w-[60px] truncate"
                      :class="player.id === user?.id ? 'text-green-600 font-bold' : 'text-gray-600'"
                    >
                      {{ player.pseudo || player.email }}
                    </span>
                  </div>
                  <!-- Empty slots -->
                  <div
                    v-for="i in tournament.numberPlayersPerTeam - (team.players?.length || 0)"
                    :key="`empty-${i}`"
                    class="flex flex-col items-center"
                  >
                    <div
                      class="w-12 h-12 bg-gray-200 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-1"
                    >
                      <span class="text-sm text-gray-400">?</span>
                    </div>
                    <span class="text-xs text-gray-400">{{ t('tournament.emptySlot') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bracket section -->
          <div class="w-full overflow-hidden">
            <TournamentBracket :teams="teams" :matches="matches" :tournament="tournament" />
          </div>
        </div>

        <!-- Sidebar with tournament info -->
        <div class="xl:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('tournament.details') }}</h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('tournament.format') }}:</span>
                <span class="font-medium text-gray-900">{{ tournament.format }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('tournament.playersPerTeam') }}:</span>
                <span class="font-medium text-gray-900">{{ tournament.numberPlayersPerTeam }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('tournament.numberOfParticipants') }}:</span>
                <span class="font-medium text-gray-900">{{ tournament.numberParticipants }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('tournament.price') }}:</span>
                <span class="font-medium text-gray-900">{{ tournament.price }}€</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('tournament.tier') }}:</span>
                <span class="font-medium text-gray-900">{{ tournament.tier }}</span>
              </div>

              <div v-if="tournament.region" class="pt-4 border-t border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{{ t('tournament.location') }}</h3>
                <p class="text-gray-700 text-sm">
                  {{ tournament.address }}<br />
                  {{ tournament.postalCode }} {{ tournament.city }}<br />
                  {{ tournament.country }}
                </p>
              </div>
              <div v-else class="pt-4 border-t border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{{ t('tournament.online') }}</h3>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-2">{{ t('tournament.dates') }}</h3>
                <p class="text-gray-700 text-sm">
                  <span class="font-medium">{{ t('tournament.startDate') }}:</span>
                  {{
                    DateTime.fromISO(tournament.startDate.toString()).toFormat('dd/MM/yyyy HH:mm')
                  }}
                  <br />
                  <span class="font-medium">{{ t('tournament.endDate') }}:</span>
                  {{ DateTime.fromISO(tournament.endDate.toString()).toFormat('dd/MM/yyyy HH:mm') }}
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
import { computed, nextTick, ref } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import Layout from '~/components/layouts/layout.vue'
import { DateTime } from 'luxon'
import TournamentBracket from '../../components/TournamentBracket.vue'
import { getCsrfToken } from '~/utils'
import imageNotFound from '~/img/Image-not-found.png'
import { useI18n } from '../../../resources/js/composables/useI18n'

const { t } = useI18n()

interface User {
  id: string
  email: string
  pseudo?: string
}

interface Player {
  id: string
  email: string
  pseudo?: string
}

interface Team {
  id: string
  name: string
  isWinner?: boolean
  players?: Player[]
  createdAt?: string
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

const { props } = usePage()
const tournament = props.tournament as Tournament
const teams = ref(props.teams as Team[])
const matches = ref(props.matches as Match[])
const user = computed(() => props.user as User | null)

// Team editing state
const editingTeamId = ref<string | null>(null)
const editingTeamName = ref('')
const teamNameInput = ref<HTMLInputElement | null>(null)

// UI state
const showSuccessMessage = ref(false)
const isJoining = ref(false)

// Generate all possible teams based on tournament participants
const allTeams = computed(() => {
  // Sort by createdAt (or id)
  return [...teams.value].sort((a, b) => {
    // If you have createdAt as a Date or ISO string:
    return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
    // Ou, si tu veux trier par id (mais ce n'est pas toujours séquentiel) :
    // return a.id.localeCompare(b.id)
  })
})

const userHasJoined = computed(() => {
  if (!user.value) return false
  return teams.value.some((team) => team.players?.some((player) => player.id === user.value?.id))
})

const userTeam = computed(() => {
  if (!user.value) return null
  return teams.value.find((team) => team.players?.some((player) => player.id === user.value?.id))
})

const isUserTeam = (team: Team): boolean => {
  if (!user.value) return false
  return team.players?.some((player) => player.id === user.value?.id) || false
}

const isEditingTeam = (team: Team): boolean => {
  return editingTeamId.value === team.id
}

const startEditingTeam = (team: Team) => {
  editingTeamId.value = team.id
  editingTeamName.value = team.name
  nextTick(() => {
    teamNameInput.value?.focus()
  })
}

const saveTeamName = async (team: Team) => {
  if (!editingTeamName.value.trim()) {
    editingTeamName.value = team.name
    editingTeamId.value = null
    return
  }

  try {
    const token = getCsrfToken()
    const response = await fetch(`/teams/${team.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ name: editingTeamName.value.trim() }),
    })
    if (response.ok) {
      team.name = editingTeamName.value.trim()
      editingTeamId.value = null
      // Add a smooth success animation
      const teamElement = document.querySelector(`[data-team-id="${team.id}"]`)
      if (teamElement) {
        teamElement.classList.add('team-update-animation')
        setTimeout(() => {
          teamElement.classList.remove('team-update-animation')
        }, 600)
      }
    } else {
      editingTeamName.value = team.name
      editingTeamId.value = null
    }
  } catch (error) {
    editingTeamName.value = team.name
    editingTeamId.value = null
  }
}

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

const joinTournament = async () => {
  if (!user.value) {
    redirectToLogin()
    return
  }

  isJoining.value = true

  try {
    // Get CSRF token from Inertia props
    const token = getCsrfToken()

    const response = await fetch(`/tournaments/${tournament.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || '',
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()

      // Update local data dynamically
      teams.value = data.teams
      matches.value = data.matches

      // Show success message
      showSuccessMessage.value = true
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 5000)
    } else {
      const errorData = await response.json()
      console.error('Error joining tournament:', errorData.error)
      alert(errorData.error || t('tournament.joinError'))
    }
  } catch (error) {
    console.error('Error joining tournament:', error)
    alert(t('tournament.joinError'))
  } finally {
    isJoining.value = false
  }
}

const redirectToLogin = () => {
  router.visit('/login')
}

const imageSource = computed(() => {
  if (tournament.id) {
    return `/tournaments/${tournament.id}/image`
  }

  return imageNotFound
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}
</script>

<style scoped>
/* Custom animations for team updates */
@keyframes teamUpdate {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.team-update-animation {
  animation: teamUpdate 0.6s ease-out;
}

/* Smooth transition for team name changes */
.team-name {
  transition: all 0.3s ease;
}

/* Enhanced pulse animation */
@keyframes enhancedPulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.01);
  }
}

.animate-pulse {
  animation: enhancedPulse 0.5s ease-in-out;
}
</style>
