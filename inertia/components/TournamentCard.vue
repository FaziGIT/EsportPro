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
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import EditSVG from '~/components/icons/EditSVG.vue'

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
})

const canEdit = computed(() => {
  if (!user.value) return false
  return isAdmin || user.value.id === props.tournament.creatorId
})

const canDelete = computed(() => {
  if (!user.value) return false
  return isAdmin || user.value.id === props.tournament.creatorId
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
      throw new Error(result.message || 'Erreur lors de la suppression du tournoi')
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
        @close="closeEditModal"
      />
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <TransitionRoot appear :show="isDeleteModalOpen" as="template">
        <Dialog as="div" @close="closeDeleteModal" class="relative z-50">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 scale-95"
                enter-to="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-95"
              >
                <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    {{ t('common.confirmDelete') }}
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      {{ t('tournament.confirmDeleteMessage') }}
                    </p>
                    <p class="mt-2 font-medium">{{ tournament?.name }}</p>

                    <div v-if="deleteError" class="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                      {{ deleteError }}
                    </div>

                    <div v-if="deleteSuccess" class="mt-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                      {{ deleteSuccess }}
                    </div>
                  </div>

                  <div class="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none"
                      @click="closeDeleteModal"
                      :disabled="isDeletingTournament"
                    >
                      {{ t('common.cancel') }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                      @click="deleteTournament"
                      :disabled="isDeletingTournament"
                    >
                      <span v-if="isDeletingTournament" class="inline-block animate-spin mr-2">↻</span>
                      {{ t('common.delete') }}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </teleport>
  </div>
</template>
