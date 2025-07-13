<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'

defineProps({
  pendingTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  }
})

function validateTournament(id: string) {
  router.post(`/profile/tournaments/${id}/validate`)
}

function refuseTournament(id: string) {
  if (confirm('Êtes-vous sûr de vouloir refuser ce tournoi ? Cette action est irréversible.')) {
    router.post(`/profile/tournaments/${id}/refuse`)
  }
}

</script>

<template>
  <div class="mt-12">
    <p class="text-2xl font-semibold mb-4">Tournois en attente de validation</p>

    <div v-if="pendingTournaments.length === 0" class="text-center py-8 text-gray-500">
      Aucun tournoi en attente de validation.
    </div>

    <div class="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
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
            <tr v-for="tournament in pendingTournaments" :key="tournament.id" class="hover:bg-gray-50">
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
                    class="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 transition-colors"
                  >
                    Valider
                  </button>
                  <button
                    @click="refuseTournament(tournament.id)"
                    class="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition-colors"
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
