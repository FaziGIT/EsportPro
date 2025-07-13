<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'
import { ref } from 'vue'
import Button from '~/components/Button.vue'

defineProps({
  pendingTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  }
})

const showConfirmRefuse = ref(false)
const tournamentToRefuse = ref('')
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success') // 'success' ou 'error'

function validateTournament(id: string) {
  // Gérer le bouton de validation
  router.post(`/profile/tournaments/${id}/validate`, {}, {
    preserveScroll: true,
    onSuccess: () => {
      showNotification.value = true
      notificationMessage.value = 'Le tournoi a été validé avec succès'
      notificationType.value = 'success'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    },
    onError: () => {
      showNotification.value = true
      notificationMessage.value = 'Une erreur est survenue lors de la validation du tournoi'
      notificationType.value = 'error'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    }
  })
}

function openRefuseConfirmation(id: string) {
  tournamentToRefuse.value = id
  showConfirmRefuse.value = true
}

function refuseTournament() {
  // Fermer la popup immédiatement
  showConfirmRefuse.value = false
  const tournamentId = tournamentToRefuse.value
  tournamentToRefuse.value = ''

  router.post(`/profile/tournaments/${tournamentId}/refuse`, {}, {
    preserveScroll: true,
    onSuccess: () => {
      showNotification.value = true
      notificationMessage.value = 'Le tournoi a été refusé avec succès'
      notificationType.value = 'success'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    },
    onError: () => {
      showNotification.value = true
      notificationMessage.value = 'Une erreur est survenue lors du refus du tournoi'
      notificationType.value = 'error'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    }
  })
}

function cancelRefuse() {
  showConfirmRefuse.value = false
  tournamentToRefuse.value = ''
}
</script>

<template>
  <div class="mt-12">
    <div v-if="showNotification"
         class="mb-4 px-4 py-3 rounded flex items-center"
         :class="notificationType === 'success' ?
                'bg-green-100 border border-green-400 text-green-700' :
                'bg-red-100 border border-red-400 text-red-700'">
      <span>{{ notificationMessage }}</span>
      <button
        @click="showNotification = false"
        class="ml-auto hover:opacity-70 cursor-pointer"
        :class="notificationType === 'success' ? 'text-green-500' : 'text-red-500'"
      >
        ✕
      </button>
    </div>

    <p class="text-2xl font-semibold mb-4">Tournois en attente de validation</p>

    <div v-if="pendingTournaments.length === 0" class="text-center py-8 text-gray-500">
      Aucun tournoi en attente de validation.
    </div>

    <div v-else class="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="max-h-96 overflow-y-auto custom-scrollbar">
          <table class="min-w-[1300px] w-full table-fixed">
            <thead class="bg-gray-100">
            <tr>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[180px]">Nom</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[140px]">Jeu</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[100px]">Format</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[120px]">Niveau</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[100px]">Prix</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[150px]">Participants</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[160px]">Lieu</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[180px]">Dates</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[160px]">Actions</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="tournament in pendingTournaments" :key="tournament.id" class="hover:bg-gray-50 cursor-default">
              <td class="px-4 py-3 text-sm text-gray-700 truncate">{{ tournament.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 truncate">{{ tournament.game?.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 truncate">{{ tournament.format }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 truncate">{{ tournament.tier }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 truncate">{{ tournament.price }} €</td>
              <td class="px-4 py-3 text-sm text-gray-700 truncate">{{ tournament.numberParticipants }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 truncate">
                {{ tournament.city ?? 'En ligne' }}{{ tournament.country ? ', ' + tournament.country : '' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 truncate">
                {{ DateTime.fromISO(tournament.startDate.toString()).toFormat('dd/MM/yyyy') }} - {{ DateTime.fromISO(tournament.endDate.toString()).toFormat('dd/MM/yyyy') }}
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex flex-row gap-1">
                  <button
                    @click="validateTournament(tournament.id)"
                    class="cursor-pointer px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 transition-colors"
                  >
                    Valider
                  </button>
                  <button
                    @click="openRefuseConfirmation(tournament.id)"
                    class="cursor-pointer px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Popup de confirmation de refus -->
    <div v-if="showConfirmRefuse" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
        <p class="text-lg font-semibold mb-4">
          Confirmer le refus
        </p>
        <p class="mb-6">
          Êtes-vous sûr de vouloir refuser ce tournoi ? Cette action est irréversible.
        </p>

        <div class="flex justify-end gap-2">
          <Button @click="refuseTournament" :use-redirection="false" color="#E74C3C" value="Refuser"/>
          <Button @click="cancelRefuse" :use-redirection="false" color="#CBD3CD" text-color="#000000" value="Annuler"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-h-96 {
  will-change: transform;
  transform: translateZ(0);
  -webkit-overflow-scrolling: touch;
}

.custom-scrollbar {
  scrollbar-gutter: stable;
}
</style>
