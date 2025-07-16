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
import { getCsrfToken } from '~/utils'
import { TrashIcon } from '~/components/icons'
import EditSVG from '~/components/icons/EditSVG.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

const { t } = useI18n()
const { user, isAdmin } = useAuth()
const isEditModalOpen = ref(false)
const showNotValidatedMessage = ref(false)
const isDeleteModalOpen = ref(false)
const isDeletingTournament = ref(false)
const deleteError = ref('')
const deleteSuccess = ref('')

const props = defineProps({
  tournament: {
    type: Object as () => Tournament,
    required: true,
  },
  games: {
    type: Array as () => Array<{ id: string; name: string }>,
    default: () => [],
  },
  needReload: {
    type: Boolean,
    default: false,
  },
})

const canEdit = computed(() => {
  if (!user.value) return false
  return isAdmin.value || (user.value.id === props.tournament.creatorId)
})

const canDelete = computed(() => {
  if (!user.value) return false
  return isAdmin.value || (user.value.id === props.tournament.creatorId)
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
  if (!props.tournament.isValidated) {
    showNotValidatedMessage.value = true
    setTimeout(() => {
      showNotValidatedMessage.value = false
    }, 3000)
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

const openDeleteModal = (event: Event) => {
  event.stopPropagation() // Prevent card click
  if (!props.tournament?.id) {
    console.error('Tournament ID is missing:', props.tournament)
    return
  }
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
  if (!props.tournament?.id || isDeletingTournament.value) return

  isDeletingTournament.value = true
  deleteError.value = ''

  try {
    const token = getCsrfToken()
    const response = await fetch(`/tournaments/${props.tournament.id}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token || '',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      deleteError.value = result.message || 'Erreur lors de la suppression du tournoi'
      return
    }

    // Suppression réussie
    deleteSuccess.value = result.message || 'Tournoi supprimé avec succès'

    // Recharger la page après 2 secondes
    setTimeout(() => {
      router.reload()
    }, 2000)

  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'Une erreur est survenue'
  } finally {
    isDeletingTournament.value = false
  }
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
    <p
      v-if="showNotValidatedMessage"
      class="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded shadow z-20"
    >
      {{ t('tournament.pendingValidationMessage') }}
    </p>
    <div
      v-if="canEdit || canDelete"
      class="absolute top-2 right-2 z-10 flex gap-2"
    >
      <button
        v-if="canEdit"
        @click="navigateToEdit"
        class="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
        :class="{ 'opacity-100': isHovered }"
      >
        <EditSVG class="w-4 h-4 cursor-pointer"/>
      </button>

      <button
        v-if="canDelete"
        @click="openDeleteModal"
        class="bg-white rounded-full p-2 shadow-md hover:bg-red-100 transition-colors duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
        :class="{ 'opacity-100': isHovered }"
      >
        <TrashIcon class="w-4 h-4 cursor-pointer" />
      </button>
    </div>

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
        :need-reload="needReload"
        @close="closeEditModal"
      />
    </teleport>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :isOpen="isDeleteModalOpen"
      :title="t('common.confirmDelete')"
      :confirmMessage="t('tournament.confirmDeleteMessage')"
      :itemName="tournament?.name || ''"
      :isProcessing="isDeletingTournament"
      :error="deleteError"
      :success="deleteSuccess"
      :needReload="needReload"
      @close="closeDeleteModal"
      @confirm="deleteTournament"
    />
  </div>
</template>
