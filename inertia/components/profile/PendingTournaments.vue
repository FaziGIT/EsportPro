<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'
import { ref } from 'vue'
import Button from '~/components/Button.vue'
import { getCsrfToken } from '~/utils'
import { useI18n } from '../../../resources/js/composables/useI18n'
const { t } = useI18n()

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
const notificationType = ref('success')
const isProcessing = ref(false)

async function validateTournament(id: string) {
  if (isProcessing.value) return

  isProcessing.value = true

  try {
    const token = getCsrfToken()

    const response = await fetch(`/profile/tournaments/${id}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || '',
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      showNotification.value = true
      notificationMessage.value = t('tournament.validateSuccess')
      notificationType.value = 'success'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)

      router.reload({ only: ['pendingTournaments'] })
    } else {
      showNotification.value = true
      notificationMessage.value = t('tournament.validateError')
      notificationType.value = 'error'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    }
  } catch (error) {
    console.error('Error validating tournament:', error)
    showNotification.value = true
    notificationMessage.value = t('tournament.validateError')
    notificationType.value = 'error'
    setTimeout(() => {
      showNotification.value = false
    }, 5000)
  } finally {
    isProcessing.value = false
  }
}

function openRefuseConfirmation(id: string) {
  tournamentToRefuse.value = id
  showConfirmRefuse.value = true
}

async function refuseTournament() {
  if (isProcessing.value) return

  // Fermer la popup immédiatement
  showConfirmRefuse.value = false
  const tournamentId = tournamentToRefuse.value
  tournamentToRefuse.value = ''

  isProcessing.value = true

  try {
    const token = getCsrfToken()
    const response = await fetch(`/profile/tournaments/${tournamentId}/refuse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || '',
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      showNotification.value = true
      notificationMessage.value = t('tournament.refuseSuccess')
      notificationType.value = 'success'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)

      router.reload({ only: ['pendingTournaments'] })
    } else {
      showNotification.value = true
      notificationMessage.value = t('tournament.refuseError')
      notificationType.value = 'error'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    }
  } catch (error) {
    console.error('Error refusing tournament:', error)
    showNotification.value = true
    notificationMessage.value = t('tournament.refuseError')
    notificationType.value = 'error'
    setTimeout(() => {
      showNotification.value = false
    }, 5000)
  } finally {
    isProcessing.value = false
  }
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

    <p class="text-2xl font-semibold mb-4">{{ t('tournament.pendingValidation') }}</p>

    <div v-if="pendingTournaments.length === 0" class="text-center py-8 text-gray-500">
      {{ t('tournament.noPendingTournaments') }}
    </div>

    <div v-else class="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="max-h-96 overflow-y-auto custom-scrollbar">
          <table class="min-w-[1300px] w-full table-fixed">
            <thead class="bg-gray-100">
            <tr>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[180px]">{{ t('tournament.name') }}</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[140px]">{{ t('tournament.game') }}</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[100px]">{{ t('tournament.format') }}</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[120px]">{{ t('tournament.level') }}</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[100px]">{{ t('tournament.price') }}</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[150px]">{{ t('tournament.participants') }}</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[160px]">{{ t('tournament.location') }}</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[180px]">{{ t('tournament.dates') }}</th>
              <th class="sticky top-0 bg-gray-100 z-10 px-4 py-3 text-left text-sm font-semibold w-[160px]">{{ t('common.actions') }}</th>
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
                {{ tournament.city ?? t('tournament.online') }}{{ tournament.country ? ', ' + tournament.country : '' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 truncate">
                {{ DateTime.fromISO(tournament.startDate.toString()).toFormat('dd/MM/yyyy') }} - {{ DateTime.fromISO(tournament.endDate.toString()).toFormat('dd/MM/yyyy') }}
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex flex-row gap-1">
                  <button
                    @click="validateTournament(tournament.id)"
                    :disabled="isProcessing"
                    class="cursor-pointer px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ t('tournament.validate') }}
                  </button>
                  <button
                    @click="openRefuseConfirmation(tournament.id)"
                    :disabled="isProcessing"
                    class="cursor-pointer px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ t('tournament.refuse') }}
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
          {{ t('tournament.confirmRefuse') }}
        </p>
        <p class="mb-6">
          {{ t('tournament.confirmRefuseMessage') }}
        </p>

        <div class="flex justify-end gap-2">
          <Button @click="refuseTournament" :use-redirection="false" color="#E74C3C" :value="t('tournament.refuse')"/>
          <Button @click="cancelRefuse" :use-redirection="false" color="#CBD3CD" text-color="#000000" :value="t('common.cancel')"/>
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
