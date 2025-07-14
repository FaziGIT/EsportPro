<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { computed, defineProps, ref } from 'vue'
import { useI18n } from '../../resources/js/composables/useI18n'
import { router } from '@inertiajs/vue3'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'
import { useAuth } from '../../resources/js/composables/useAuth'
import TournamentForm from './TournamentForm.vue'
import { TournamentStatus } from '#types/tournament'

const { t } = useI18n()
const { user } = useAuth()
const isEditModalOpen = ref(false)

const props = defineProps({
  tournament: {
    type: Object as () => Tournament,
    required: true,
  },
  games: {
    type: Array as () => Array<{ id: string; name: string }>,
    default: () => [],
  },
})

const canEdit = computed(() => {
  if (!user.value) return false
  return user.value.role === 'admin' || user.value.id === props.tournament.creatorId
})

const imageSource = computed(() => {
  if (props.tournament?.id) {
    return `/tournaments/${props.tournament.id}/image`
  }

  return imageNotFound
})

const isHovered = ref(false)

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}

const navigateToTournament = () => {
  if (!props.tournament?.id) {
    console.error('Tournament ID is missing:', props.tournament)
    return
  }

  router.visit(`/tournaments/${props.tournament.id}`)
}

const navigateToEdit = (event: Event) => {
  event.stopPropagation() // Prevent card click
  if (!props.tournament?.id) {
    console.error('Tournament ID is missing:', props.tournament)
    return
  }
  if (!canEdit.value) {
    return
  }
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}
</script>

<template>
  <div
    class="flex flex-col justify-between w-96 h-96 min-w-80 rounded-xl shadow-md bg-white overflow-hidden border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative"
    @click="navigateToTournament"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <button
      v-if="canEdit"
      @click="navigateToEdit"
      class="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
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

    <div class="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
      <div class="flex flex-col items-center justify-center text-gray-500">
        <img
          :src="imageSource"
          alt="Tournoi Image"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
      </div>
    </div>

    <div class="p-4 flex flex-col justify-between flex-grow">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-bold text-black truncate max-w-[calc(100%-28px)]">
          {{ tournament.name || t('tournament.tournamentNameUndefined') }}
        </h3>
      </div>

      <p class="text-sm text-gray-600 line-clamp-2">
        {{ tournament.address || '' }} {{ tournament.city || '' }} {{ tournament.postalCode || ''
        }}{{ tournament.country ? ', ' + tournament.country : '' }}
      </p>

      <div class="mt-auto flex flex-row justify-between">
        <div>
          <p class="text-sm text-gray-600">
            {{
              tournament.numberPlayersPerTeam > 1
                ? t('tournament.teamsOf') + ' ' + tournament.numberPlayersPerTeam
                : t('tournament.stillUnknown')
            }}
          </p>
          <p class="text-sm text-gray-600">
            {{ DateTime.fromISO(tournament.startDate.toString()).toFormat('dd/MM/yyyy HH:mm') }}
          </p>
        </div>
        <div class="">
          <p
            class="text-sm text-[#5C4741] font-semibold bg-[#CBD3CD] border-[#CBD3CD] border-2 rounded-md px-2 py-1 w-fit"
          >
            {{ tournament.format || t('tournament.undefinedFormat') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tournament Edit Modal -->
    <teleport to="body">
      <TournamentForm
        v-if="canEdit"
        :isOpen="isEditModalOpen"
        :mode="TournamentStatus.EDIT"
        :tournament="props.tournament"
        :games="props.games"
        @close="closeEditModal"
      />
    </teleport>
  </div>
</template>
