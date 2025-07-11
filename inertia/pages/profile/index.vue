<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import GeneralInfoUser from '~/components/profile/GeneralInfoUser.vue'
import { defineProps } from 'vue'
import User from '#models/user'
import TournamentCard from '~/components/TournamentCard.vue'
import GameCard from '~/components/GameCard.vue'
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { UserRole } from '#enums/user_role'
import { router } from '@inertiajs/vue3'

defineProps({
  user: {
    type: Object as () => User,
    required: true,
  },
  tournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
  favoriteGames: {
    type: Array as () => Game[],
    default: () => [],
  },
  pendingTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
})

function validateTournament(id: string) {
  router.post(`/profile/tournaments/${id}/validate`)
}

function refuseTournament(id: string) {
  if (confirm('Êtes-vous sûr de vouloir refuser ce tournoi ? Cette action est irréversible.')) {
    router.post(`/profile/tournaments/${id}/refuse`)
  }
}

function formatDate(dateStr: any): string {
  if (!dateStr) return 'Date inconnue';

  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Date invalide';
  }
}
</script>

<template>
  <Layout class="bg-[#fafafa]">
    <p class="text-4xl font-semibold">Mon profil</p>
    <GeneralInfoUser :user="user" />

    <!-- Section Admin: Tournois en attente de validation -->
    <div v-if="user.role === UserRole.Admin" class="mt-12">
      <p class="text-2xl font-semibold mb-4">Tournois en attente de validation</p>

      <div v-if="pendingTournaments.length === 0" class="text-center py-8 text-gray-500">
        Aucun tournoi en attente de validation.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jeu</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Format</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Niveau</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prix</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Participants</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lieu</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dates</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="tournament in pendingTournaments" :key="tournament.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-700">{{ tournament.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ tournament.game?.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ tournament.format }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ tournament.tier }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ tournament.price }} €</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ tournament.numberParticipants }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">
                {{ tournament.city ?? 'En ligne' }}{{ tournament.country ? ', ' + tournament.country : '' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">
                {{ formatDate(tournament.startDate) }} -
                {{ formatDate(tournament.endDate) }}
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex space-x-2">
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

    <p class="text-2xl font-semibold mt-12">Mes prochains tournois</p>
    <div v-if="!tournaments || tournaments.length === 0" class="text-center py-8 text-gray-500">
      Aucun tournoi en cours.
    </div>
    <div v-else class="py-8">
      <Carousel
        snapAlign="start"
        :items-to-show="4"
        :wrap-around="false"
        :breakpoints="{
          1280: { itemsToShow: 4 },
          1024: { itemsToShow: 3 },
          768: { itemsToShow: 2 },
          0: { itemsToShow: 1 },
        }"
        class="tournament-carousel"
      >
        <Slide
          v-for="tournament in tournaments"
          :key="tournament.id"
          class="flex justify-center px-4"
        >
          <TournamentCard :tournament="tournament" />
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>

    <p class="text-2xl font-semibold mt-12">Mes jeux favoris</p>
    <div v-if="!favoriteGames || favoriteGames.length === 0" class="text-center py-8 text-gray-500">
      Aucun jeu favori.
    </div>
    <div v-else class="py-8">
      <Carousel
        snapAlign="start"
        :items-to-show="6"
        :wrap-around="false"
        :breakpoints="{
          1280: { itemsToShow: 6 },
          1024: { itemsToShow: 4 },
          768: { itemsToShow: 3 },
          0: { itemsToShow: 2 },
        }"
        class="game-carousel"
      >
        <Slide
          v-for="game in favoriteGames"
          :key="game.id"
          class="flex justify-center px-4"
        >
          <GameCard :game="game" />
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>
  </Layout>
</template>
