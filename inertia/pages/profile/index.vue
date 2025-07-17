<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import GeneralInfoUser from '~/components/profile/GeneralInfoUser.vue'
import PendingTournaments from '~/components/profile/PendingTournaments.vue'
import { computed, defineProps } from 'vue'
import User from '#models/user'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { useI18n } from '../../../resources/js/composables/useI18n'
import CreatedTournamentsSection from '~/components/profile/CreatedTournamentsSection.vue'
import GamesCarousel from '~/components/game/GamesCarousel.vue'
import TournamentsCarousel from '~/components/tournament/TournamentsCarousel.vue'
import UserStatsSection from '~/components/profile/UserStatsSection.vue'
import AdminUserTable from '~/components/profile/AdminUserTable.vue'
import { useAuth } from '../../../resources/js/composables/useAuth'
import { UserRole } from '#enums/user_role'

const { t } = useI18n()
const { isAdmin } = useAuth()

const props = defineProps({
  user: {
    type: Object as () => User,
    required: true,
  },
  targetUser: {
    type: Object as () => User,
    default: null,
  },
  isOwnProfile: {
    type: Boolean,
    default: true,
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
  allUsers: {
    type: Array as () => User[],
    default: () => [],
  },
})

const displayedUser = computed(() => {
  return props.isOwnProfile ? props.user : props.targetUser
})

// Titre de la page en fonction du contexte
const pageTitle = computed(() => {
  if (props.isOwnProfile) {
    return t('profile.myProfile')
  }
  return t('profile.userProfile', { user: displayedUser.value?.pseudo || '' })
})

// Fonction pour obtenir le texte du rôle utilisateur
const userRoleText = computed(() => {
  switch (displayedUser.value?.role) {
    case UserRole.Admin:
      return t('common.adminRole')
    case UserRole.Banned:
      return t('common.bannedRole')
    default:
      return t('common.userRole')
  }
})

// Badge de rôle
const userRoleClass = computed(() => {
  switch (displayedUser.value?.role) {
    case UserRole.Admin:
      return 'bg-indigo-100 text-indigo-800'
    case UserRole.Banned:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
})

// Vérifier si le profil est privé
const isPrivateProfile = computed(() => {
  return !props.isOwnProfile && props.targetUser?.isPrivate
})
</script>

<template>
  <Layout class="bg-[#fafafa]">
    <div class="flex justify-between items-center">
      <p class="text-4xl font-semibold">{{ pageTitle }}</p>
      <span
        v-if="!isOwnProfile"
        :class="[
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-4',
          userRoleClass,
        ]"
      >
        {{ userRoleText }}
      </span>
    </div>

    <!-- Message pour profil privé -->
    <div v-if="isPrivateProfile" class="mt-8 bg-[#CBD3CD]/40 border border-[#CBD3CD] rounded-lg p-6 text-center">
      <div class="flex flex-col items-center">
        <h2 class="text-3xl font-semibold text-amber-900 mb-2">{{ t('profile.privateProfile') }}</h2>
        <p class="text-amber-800 mb-4">{{ t('profile.privateProfileMessage') }}</p>
      </div>
    </div>

    <!-- Afficher GeneralInfoUser uniquement si c'est le profil de l'utilisateur courant -->
    <GeneralInfoUser v-if="isOwnProfile" :user="user" />

    <!-- N'afficher le contenu du profil que s'il n'est pas privé ou s'il appartient à l'utilisateur connecté -->
    <template v-if="!isPrivateProfile">
      <!-- Section de statistiques utilisateur (visible par tous) -->
      <UserStatsSection
        v-if="displayedUser"
        :user-id="displayedUser.id"
        :user-tournaments="tournaments"
        :finished-tournaments="finishedTournaments"
        :game-stats="gameStats"
      />

      <!-- Section Admin: Tournois en attente de validation (seulement pour son propre profil) -->
      <PendingTournaments
        v-if="isAdmin && isOwnProfile"
        :pendingTournaments="pendingTournaments"
      />
      <AdminUserTable v-if="isAdmin && isOwnProfile" :users="allUsers"/>

      <!-- Section des prochains tournois (visible par tous) -->
      <TournamentsCarousel
        :list-tournaments="tournaments"
        :no-element-message="t('tournament.noCurrentTournaments')"
        :title="isOwnProfile ? t('profile.nextTournaments') : t('profile.userTournaments')"
        :games="games"
      />

      <!-- Section des tournois terminés (visible par tous) -->
      <TournamentsCarousel v-if="finishedTournaments && finishedTournaments.length > 0"
        :list-tournaments="finishedTournaments"
        :no-element-message="t('profile.noFinishedTournaments')"
        :title="t('profile.finishedTournaments')"
        :games="games"
      />

      <!-- Section des tournois créés par l'utilisateur (visible par tous) -->
      <CreatedTournamentsSection
        v-if="createdTournaments && createdTournaments.length > 0"
        :my-created-tournaments="createdTournaments"
        :games="games"
        :is-own-profile="isOwnProfile"
      />

      <!-- Section des jeux favoris (visible par tous) -->
      <GamesCarousel
        :list-games="favoriteGames"
        :no-element-message="t('profile.noFavoriteGames')"
        :title="isOwnProfile ? t('profile.favoriteGames') : t('profile.userFavoriteGames')"
      />
    </template>
  </Layout>
</template>
