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
const errorMessage = ref('')
const showError = ref(false)

function validateTournament(id: string) {
  router.post(`/profile/tournaments/${id}/validate`)
}

function openRefuseConfirmation(id: string) {
  tournamentToRefuse.value = id
  showConfirmRefuse.value = true
  errorMessage.value = ''
  showError.value = false
}

function refuseTournament() {
  router.post(`/profile/tournaments/${tournamentToRefuse.value}/refuse`, {}, {
    onSuccess: () => {
      showConfirmRefuse.value = false
      tournamentToRefuse.value = ''
    },
    onError: (errors) => {
      console.error('Erreur de refus:', errors)
      if (errors.message) {
        errorMessage.value = errors.message
      } else {
        errorMessage.value = "Une erreur s'est produite lors de la suppression du tournoi."
      }
      showError.value = true
    }
  })
}

function cancelRefuse() {
  showConfirmRefuse.value = false
  tournamentToRefuse.value = ''
  errorMessage.value = ''
  showError.value = false
}
</script>

<template>
  <div class="mt-12">
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

        <!-- Message d'erreur -->
        <div v-if="showError" class="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {{ errorMessage }}
        </div>

        <div class="flex justify-end gap-2">
          <Button @click="refuseTournament" :use-redirection="false" value="Valider"/>
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
