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
import UserStatsSection from '~/components/profile/UserStatsSection.vue'

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
  createdTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
  finishedTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
  gameStats: {
    type: Object,
    default: () => ({}),
  },
  games: {
    type: Array as () => Game[],
    default: () => [],
  },
})
</script>

<template>
  <Layout class="bg-[#fafafa]">
    <p class="text-4xl font-semibold">{{ t('profile.myProfile') }}</p>
    <GeneralInfoUser :user="user" />

    <!-- Section de statistiques utilisateur -->
    <UserStatsSection
      v-if="user"
      :user-id="user.id"
      :user-tournaments="tournaments"
      :finished-tournaments="finishedTournaments"
      :game-stats="gameStats"
    />

    <!-- Section Admin: Tournois en attente de validation -->
    <PendingTournaments
      v-if="user.role === UserRole.Admin"
      :pendingTournaments="pendingTournaments"
    />

    <!-- Section des prochains tournois -->
    <TournamentsCarousel
      :list-tournaments="tournaments"
      :no-element-message="t('tournament.noCurrentTournaments')"
      :title="t('profile.nextTournaments')"
      :games="games"
    />

    <!-- Section des tournois terminés -->
    <TournamentsCarousel v-if="finishedTournaments && finishedTournaments.length > 0"
      :list-tournaments="finishedTournaments"
      :no-element-message="t('profile.noFinishedTournaments')"
      :title="t('profile.finishedTournaments')"
      :games="games"
    />

    <!-- Section des tournois créés par l'utilisateur -->
    <CreatedTournamentsSection
      v-if="createdTournaments && createdTournaments.length > 0"
      :my-created-tournaments="createdTournaments"
      :games="games"
    />

    <!-- Section des jeux favoris -->
    <GamesCarousel
      :list-games="favoriteGames"
      :no-element-message="t('profile.noFavoriteGames')"
      :title="t('profile.favoriteGames')"
    />
  </Layout>
</template>
