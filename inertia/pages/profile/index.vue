<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import GeneralInfoUser from '~/components/profile/GeneralInfoUser.vue'
import PendingTournaments from '~/components/profile/PendingTournaments.vue'
import { defineProps, computed } from 'vue'
import User from '#models/user'
import TournamentCard from '~/components/TournamentCard.vue'
import GameCard from '~/components/GameCard.vue'
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { UserRole } from '#enums/user_role'
import { useI18n } from '../../../resources/js/composables/useI18n'
import CreatedTournamentsSection from '~/components/profile/CreatedTournamentsSection.vue'

const { t } = useI18n()

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
  myCreatedTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
})

</script>

<template>
  <Layout class="bg-[#fafafa]">
    <p class="text-4xl font-semibold">Mon profil</p>
    <GeneralInfoUser :user="user" />

    <!-- Section Admin: Tournois en attente de validation -->
    <PendingTournaments
      v-if="user.role === UserRole.Admin"
      :pendingTournaments="pendingTournaments"
    />

    <p class="text-2xl font-semibold mt-12">Mes prochains tournois</p>
    <div v-if="!tournaments || tournaments.length === 0" class="text-center py-8 text-gray-500">
      Aucun tournoi en cours.
    </div>
    <div v-else class="py-8">
      <Carousel
        class="w-full"
        snapAlign="start"
        :wrap-around="false"
        :items-to-show="4"
        :breakpoints="{
          1450: { itemsToShow: 4 },
          1130: { itemsToShow: 3 },
          768: { itemsToShow: 2 },
          0: { itemsToShow: 1 },
        }"
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

<!--     Section des tournois créés par l'utilisateur -->
    <CreatedTournamentsSection v-if="myCreatedTournaments && myCreatedTournaments.length > 0 && user.role ==='user'" :my-created-tournaments="myCreatedTournaments" />

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
