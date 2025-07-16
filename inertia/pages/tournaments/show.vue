<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import Layout from '~/components/layouts/layout.vue'
import TournamentForm from '~/components/TournamentForm.vue'
import { DateTime } from 'luxon'
import TournamentBracket from '../../components/TournamentBracket.vue'
import { getCsrfToken } from '~/utils'
import imageNotFound from '~/img/Image-not-found.png'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { useAuth } from '../../../resources/js/composables/useAuth'
import { useTournamentData } from '../../../resources/js/composables/usePageProps'
import { useChatStore } from '~/store/chat_store'
import Team from '#models/team'
import User from '#models/user'
import { TrashIcon } from '~/components/icons'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import { TournamentStatus } from '#types/tournament'

const { t } = useI18n()
const { user, isAdmin } = useAuth()
const { tournament, teams, matches } = useTournamentData()
const chatStore = useChatStore()

const props = defineProps<{
  games: Array<{
    id: string
    name: string
  }>
}>()

// Modals
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeletingTournament = ref(false)
const deleteError = ref('')
const deleteSuccess = ref('')

// Team editing state
const editingTeamId = ref<string | null>(null)
const editingTeamName = ref('')
const teamNameInput = ref<HTMLInputElement | null>(null)

// UI state
const showSuccessMessage = ref(false)
const message = ref<['success' | 'error', string]>(['success', ''])
const isJoining = ref(false)
const isLeaving = ref(false)
const isStarting = ref(false)

// Generate all possible teams based on tournament participants
const allTeams = computed(() => {
  // Sort by createdAt (or id)
  return [...teams.value].sort((a, b) => {
    const aTime = a.createdAt
      ? typeof a.createdAt === 'string'
        ? new Date(a.createdAt).getTime()
        : a.createdAt.toMillis()
      : 0
    const bTime = b.createdAt
      ? typeof b.createdAt === 'string'
        ? new Date(b.createdAt).getTime()
        : b.createdAt.toMillis()
      : 0
    return aTime - bTime
  })
})

const userHasJoined = computed(() => {
  if (!user.value) return false
  return teams.value.some((team) => team.players?.some((player) => player.id === user.value?.id))
})

const isUserTeam = (team: Team): boolean => {
  if (!user.value) return false
  return team.players?.some((player) => player.id === String(user.value?.id)) || false
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
  if (!tournament.value.startDate) return false

  try {
    let startDate: DateTime

    startDate = DateTime.fromISO(String(tournament.value.startDate))

    return DateTime.now() >= startDate
  } catch (error) {
    console.error('Error checking tournament start date:', error)
    return false
  }
})

const isTournamentFull = computed(() => {
  // Count total players across all teams
  const totalPlayers = teams.value.reduce((total, team) => {
    return total + (team.players?.length || 0)
  }, 0)

  return totalPlayers >= tournament.value.numberParticipants
})

const canStartTournament = computed(() => {
  if (!user.value || tournament.value.isStarted) return false

  // Check if user is admin or creator
  const userIsAdmin = isAdmin.value
  const userIsCreator = tournament.value.creator?.id === user.value.id
  if (!userIsAdmin && !userIsCreator) return false

  // Check if it's past the start date
  try {
    const startDate = DateTime.fromISO(String(tournament.value.startDate))

    return DateTime.now() >= startDate
  } catch (error) {
    return false
  }
})

const canEdit = computed(() => {
  if (!user.value) return false
  return isAdmin.value || tournament.value.creatorId === user.value.id
})

const canDelete = computed(() => {
  if (!user.value) return false
  return isAdmin.value || tournament.value.creatorId === user.value.id
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

    const response = await fetch(`/tournaments/${tournament.value.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || '',
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      showSuccessMessage.value = true
      message.value = ['success', t('tournament.joinSuccess')]
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 5000)

      chatStore.triggerChannelRefresh()

      router.reload({ only: ['teams', 'matches', 'userTournaments'] })
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

const navigateToEdit = () => {
  if (!canEdit.value) {
    return
  }

  isEditModalOpen.value = true
}

const openDeleteModal = () => {
  if (!canDelete.value) {
    return
  }
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deleteError.value = ''
  deleteSuccess.value = ''
}

const deleteTournament = async () => {
  if (!tournament.value.id || isDeletingTournament.value) return

  isDeletingTournament.value = true
  deleteError.value = ''

  try {
    const token = getCsrfToken()
    const response = await fetch(`/tournaments/${tournament.value.id}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token || '',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      deleteError.value = result.message || 'An error occurred while deleting the tournament'
      return
    }

    // Suppression réussie
    deleteSuccess.value = result.message || 'Tournament deleted successfully'

    // Rediriger vers la page des tournois après 2 secondes
    setTimeout(() => {
      router.visit('/tournaments')
    }, 2000)

  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'An error occurred while deleting the tournament'
  } finally {
    isDeletingTournament.value = false
  }
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const leaveTournament = async () => {
  if (!user.value) {
    redirectToLogin()
    return
  }

  // Confirm before leaving
  if (!confirm(t('tournament.confirmLeave'))) {
    return
  }

  isLeaving.value = true

  try {
    const token = getCsrfToken()

    const response = await fetch(`/tournaments/${tournament.value.id}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || '',
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      showSuccessMessage.value = true
      message.value = ['error', t('tournament.leaveSuccess')]
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 5000)

      router.reload({ only: ['teams', 'matches', 'userTournaments'] })
    } else {
      const errorData = await response.json()
      console.error('Error leaving tournament:', errorData.error)
      alert(errorData.error || t('tournament.leaveError'))
    }
  } catch (error) {
    console.error('Error leaving tournament:', error)
    alert(t('tournament.leaveError'))
  } finally {
    isLeaving.value = false
  }
}

const startTournament = async () => {
  if (!user.value) {
    redirectToLogin()
    return
  }

  isStarting.value = true

  try {
    const token = getCsrfToken()
    const response = await fetch(`/tournaments/${tournament.value.id}/launch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || '',
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      showSuccessMessage.value = true
      message.value = ['success', t('tournament.startSuccess')]
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 5000)

      router.reload({ only: ['tournament', 'matches'] })
    } else {
      const errorData = await response.json()
      console.error('Error starting tournament:', errorData.error)
      alert(errorData.error || t('tournament.startError'))
    }
  } catch (error) {
    console.error('Error starting tournament:', error)
    alert(t('tournament.startError'))
  } finally {
    isStarting.value = false
  }
}

const redirectToLogin = () => {
  router.visit('/login')
}

const imageSource = computed(() => {
  if (tournament.value.id) {
    return `/tournaments/${tournament.value.id}/image`
  }

  return imageNotFound
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}

const handleMatchUpdated = () => {
  // Show success message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)

  router.reload({ only: ['tournament', 'matches'] })
}

const tournamentFinished = computed(() => {
  // Un tournoi est terminé s'il a un gagnant ou si la date de fin est passée
  if (tournament.value.winnerId) return true

  try {
    let endDate: DateTime = DateTime.fromISO(String(tournament.value.endDate))
    return DateTime.now() >= endDate
  } catch (error) {
    console.error('Error checking tournament end date:', error)
    return false
  }
})

const winningTeam = computed(() => {
  if (!tournament.value.winnerId) return null
  return teams.value.find(team => team.id === tournament.value.winnerId)
})
</script>
<template>
  <Layout>
    <div class="px-4 sm:px-6 py-6">
      <!-- Success notification -->
      <div
        v-if="showSuccessMessage"
        :class="
          message[0] === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        "
        class="mb-4 px-4 py-3 rounded"
      >
        <div class="flex items-center">
          <span>{{ message[1] }}</span>
          <button
            @click="showSuccessMessage = false"
            :class="
              message[0] === 'success'
                ? 'ml-auto text-green-500 hover:text-green-700'
                : 'ml-auto text-red-500 hover:text-red-700'
            "
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Header with title and join button -->
      <div class="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
          {{ tournament.name }}
        </h1>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <!-- Edit and Delete buttons -->
          <div class="flex gap-2">
            <button
              v-if="canDelete"
              @click="openDeleteModal"
              class="font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition bg-orange-600  hover:bg-orange-700 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <TrashIcon class="w-4 h-4" color="#FFFF" />
            </button>

            <button
              v-if="canEdit"
              @click="navigateToEdit"
              class="font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
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
              <span class="hidden sm:inline">{{ t('tournament.editTournament') }}</span>
              <span class="sm:hidden">{{ t('tournament.editTournament') }}</span>
            </button>
          </div>

          <!-- Start Tournament Button (Admin or Creator only, after start date) -->
          <button
            v-if="canStartTournament"
            @click="startTournament"
            :disabled="isStarting"
            class="font-semibold px-6 py-3 rounded-lg transition bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ isStarting ? t('tournament.starting') : t('tournament.startTournament') }}
          </button>

          <!-- Join Tournament Button -->
          <button
            v-if="
              !userHasJoined &&
              !tournamentStarted &&
              user &&
              !tournament.isStarted &&
              !isTournamentFull &&
              !tournamentFinished
            "
            @click="joinTournament"
            :disabled="isJoining"
            class="font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition bg-[#5C4741] text-white hover:bg-[#7b5f57] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
          >
            {{ isJoining ? t('tournament.joining') : t('tournament.join') }}
          </button>

          <!-- Leave Tournament Button -->
          <button
            v-if="userHasJoined && !tournament.isStarted"
            @click="leaveTournament"
            :disabled="isLeaving"
            class="font-semibold px-6 py-3 rounded-lg transition bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ isLeaving ? t('tournament.leaving') : t('tournament.leave') }}
          </button>
          <button
            v-else-if="
              !userHasJoined &&
              !tournamentStarted &&
              user &&
              !tournament.isStarted &&
              isTournamentFull
            "
            disabled
            class="font-semibold px-6 py-3 rounded-lg bg-red-100 text-red-700 cursor-not-allowed"
          >
            {{ t('tournament.full') }}
          </button>
          <button
            v-else-if="!user && !tournament.isStarted && !isTournamentFull"
            @click="redirectToLogin"
            class="font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition bg-[#5C4741] text-white hover:bg-[#7b5f57] text-sm sm:text-base cursor-pointer"
          >
            {{ t('tournament.loginToJoin') }}
          </button>
          <div
            v-else-if="!user && !tournament.isStarted && isTournamentFull"
            class="font-semibold px-6 py-3 rounded-lg bg-red-100 text-red-700"
          >
            {{ t('tournament.full') }}
          </div>
          <div
            v-else-if="userHasJoined && !tournament.isStarted"
            class="font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-green-100 text-green-700 text-center text-sm sm:text-base"
          >
            {{ t('tournament.alreadyJoined') }}
          </div>
          <div
            v-else-if="tournamentFinished"
            class="font-semibold px-6 py-3 rounded-lg bg-purple-100 text-purple-700 cursor-default"
          >
            {{ t('tournament.finished') }}
          </div>
          <div
            v-else-if="tournament.isStarted"
            class="font-semibold px-6 py-3 rounded-lg bg-blue-100 text-blue-700 cursor-default"
          >
            {{ t('tournament.started') }}
          </div>
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
          <!-- Affichage du gagnant si le tournoi est terminé et a un gagnant -->
          <div v-if="tournamentFinished && winningTeam" class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 cursor-default">{{ t('tournament.winnerTeam') }}</h2>
            <div class="flex items-center justify-center p-4 bg-purple-50 rounded-lg">
              <div class="flex flex-col items-center">
                <h3 class="text-xl font-bold text-purple-800">{{ winningTeam.name }}</h3>
                <div class="mt-4 flex flex-wrap gap-3 justify-center">
                  <div v-for="player in winningTeam.players" :key="player.id" class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-white border-2 border-yellow-500 flex items-center justify-center mb-1">
                      <span class="text-sm font-medium text-gray-700">
                        {{ player.pseudo?.charAt(0)}}
                      </span>
                    </div>
                    <span class="text-xs text-center max-w-[60px] truncate text-gray-700">
                      {{ player.pseudo }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                v-for="team in allTeams as Team[]"
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
                    v-for="player in team.players as User[]"
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
            <!-- I dont know how to fix this error, he dont want to use the Adonis model types -->
            <TournamentBracket
              :teams="teams as any"
              :matches="matches as any"
              :tournament="tournament as any"
              :user="user as any"
              :isAdmin="isAdmin"
              @matchUpdated="handleMatchUpdated"
            />
          </div>
        </div>

        <!-- Sidebar with tournament info -->
        <div class="xl:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('tournament.details') }}</h2>

            <div class="space-y-4">
              <div v-if="tournamentFinished" class="py-2 px-3 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium mb-4 cursor-default">
                {{ t('tournament.tournamentFinished') }}
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ t('game.gameName') }}:</span>
                <span class="font-medium text-gray-900">{{ tournament.game.name }}</span>
              </div>

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

    <!-- Tournament Edit Modal -->
    <TournamentForm
      v-if="canEdit"
      :isOpen="isEditModalOpen"
      :mode="TournamentStatus.EDIT"
      :tournament="tournament as any"
      :games="props.games"
      :need-reload="true"
      @close="closeEditModal"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :isOpen="isDeleteModalOpen"
      :title="t('common.confirmDelete')"
      :confirmMessage="t('tournament.confirmDeleteMessage')"
      :itemName="tournament?.name || ''"
      :isProcessing="isDeletingTournament"
      :error="deleteError"
      :success="deleteSuccess"
      @close="closeDeleteModal"
      @confirm="deleteTournament"
    />
  </Layout>
</template>

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
