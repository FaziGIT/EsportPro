<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import GeneralInfoUser from '~/components/profile/GeneralInfoUser.vue'
import PendingTournaments from '~/components/profile/PendingTournaments.vue'
import { defineProps } from 'vue'
import User from '#models/user'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { UserRole } from '#enums/user_role'
import { useI18n } from '../../../resources/js/composables/useI18n'
import CreatedTournamentsSection from '~/components/profile/CreatedTournamentsSection.vue'
import GamesCarousel from '~/components/game/GamesCarousel.vue'
import TournamentsCarousel from '~/components/tournament/TournamentsCarousel.vue'

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

    <!-- Section des prochains tournois -->
    <TournamentsCarousel :listTournaments="tournaments" :noElementMessage="'Aucun tournoi en cours.'" :title="'Mes prochains tournois'" />

    <!-- Section des tournois créés par l'utilisateur -->
    <CreatedTournamentsSection v-if="myCreatedTournaments && myCreatedTournaments.length > 0 && user.role ==='user'" :myCreatedTournaments="myCreatedTournaments" />

    <!-- Section des jeux favoris -->
    <GamesCarousel :listGames="favoriteGames" :noElementMessage="'Aucun jeu favori.'" :title="'Mes jeux favoris'" />

  </Layout>
</template>
