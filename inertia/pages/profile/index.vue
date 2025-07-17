<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import GeneralInfoUser from '~/components/profile/GeneralInfoUser.vue'
import PendingTournaments from '~/components/profile/PendingTournaments.vue'
import { computed, defineProps, ref } from 'vue'
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
import { getCsrfToken } from '~/utils'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

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
  isAdminViewing: {
    type: Boolean,
    default: false,
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

const canBanUser = computed(() => {
  return props.isAdminViewing &&
         !props.isOwnProfile &&
         props.targetUser?.role !== UserRole.Admin &&
         props.targetUser?.role !== UserRole.Banned
})

const canUnbanUser = computed(() => {
  return props.isAdminViewing &&
         !props.isOwnProfile &&
         props.targetUser?.role === UserRole.Banned
})

// États pour les modals de ban/unban
const showBanConfirm = ref(false)
const showUnbanConfirm = ref(false)
const isProcessing = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')

const openBanConfirmModal = () => {
  if (!canBanUser.value || !props.targetUser) return
  showBanConfirm.value = true
}

const closeBanConfirmModal = () => {
  showBanConfirm.value = false
}

const confirmBan = async () => {
  if (!canBanUser.value || !props.targetUser) return

  isProcessing.value = true

  try {
    const token = getCsrfToken()
    const response = await fetch(`/profile/ban-user/${props.targetUser.id}/ban`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token || '',
      },
    })

    if (response.ok) {
      showNotification.value = true
      notificationMessage.value = 'Utilisateur banni avec succès'
      notificationType.value = 'success'
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      showNotification.value = true
      notificationMessage.value = 'Un administrateur ne peut être banni'
      notificationType.value = 'error'
    }
  } catch (error) {
    showNotification.value = true
    notificationMessage.value = 'Une erreur est survenue lors du bannissement'
    notificationType.value = 'error'
  } finally {
    isProcessing.value = false
    closeBanConfirmModal()
  }
}

const openUnbanConfirmModal = () => {
  if (!canUnbanUser.value || !props.targetUser) return
  showUnbanConfirm.value = true
}

const closeUnbanConfirmModal = () => {
  showUnbanConfirm.value = false
}

const confirmUnban = async () => {
  if (!canUnbanUser.value || !props.targetUser) return

  isProcessing.value = true

  try {
    const token = getCsrfToken()
    const response = await fetch(`/profile/unban-user/${props.targetUser.id}/unban`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token || '',
      },
    })

    if (response.ok) {
      showNotification.value = true
      notificationMessage.value = 'Utilisateur débanni avec succès'
      notificationType.value = 'success'
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      showNotification.value = true
      notificationMessage.value = 'Une erreur est survenue lors du débannissement'
      notificationType.value = 'error'
    }
  } catch (error) {
    showNotification.value = true
    notificationMessage.value = 'Une erreur est survenue lors du débannissement'
    notificationType.value = 'error'
  } finally {
    isProcessing.value = false
    closeUnbanConfirmModal()
  }
}
</script>

<template>
  <Layout class="bg-[#fafafa]">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <p class="text-4xl font-semibold">{{ pageTitle }}</p>
        <span
          v-if="!isOwnProfile"
          :class="[
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-4 mt-4',
            userRoleClass,
          ]"
        >
          {{ userRoleText }}
        </span>
      </div>

      <!-- Actions d'admin (bannissement/débannissement) -->
      <div v-if="!isOwnProfile && isAdminViewing" class="flex space-x-2">
        <button
          v-if="canBanUser"
          @click="openBanConfirmModal"
          class="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          {{ t('admin.users.ban') }}
        </button>
        <button
          v-if="canUnbanUser"
          @click="openUnbanConfirmModal"
          class="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          {{ t('admin.users.unban') }}
        </button>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="showNotification"
         class="mt-4 mb-4 px-4 py-3 rounded flex items-center"
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

  <!-- Modal de confirmation pour le bannissement -->
  <ConfirmationModal
    :isOpen="showBanConfirm"
    :title="'Confirmer le bannissement'"
    :confirmMessage="'Êtes-vous sûr de vouloir bannir l\'utilisateur'"
    :itemName="displayedUser?.pseudo || ''"
    :warningMessage="'Cette action empêchera l\'utilisateur d\'accéder à la plateforme.'"
    :isProcessing="isProcessing"
    :confirmButtonText="t('common.ban')"
    :confirmButtonColor="'bg-red-600 hover:bg-red-700'"
    @close="closeBanConfirmModal"
    @confirm="confirmBan"
  />

  <!-- Modal de confirmation pour le débannissement -->
  <ConfirmationModal
    :isOpen="showUnbanConfirm"
    :title="'Confirmer le débannissement'"
    :confirmMessage="'Êtes-vous sûr de vouloir débannir l\'utilisateur'"
    :itemName="displayedUser?.pseudo || ''"
    :warningMessage="'Cette action permettra à l\'utilisateur d\'accéder à nouveau à la plateforme.'"
    :isProcessing="isProcessing"
    :confirmButtonText="'Débannir'"
    :confirmButtonColor="'bg-green-600 hover:bg-green-700'"
    @close="closeUnbanConfirmModal"
    @confirm="confirmUnban"
  />
</template>
