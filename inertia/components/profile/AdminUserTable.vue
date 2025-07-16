<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import BanIcon from '~/components/icons/BanIcon.vue'
import { UserRole, UserRoleValues } from '#enums/user_role'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { router } from '@inertiajs/vue3'
import { getCsrfToken } from '~/utils'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import Button from "~/components/Button.vue";

const { t } = useI18n()

const props = defineProps<{
  users: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }[]
}>()

const processingUser = ref('')
const showConfirm = ref(false)
const userToBan = ref('')
const userToBanName = ref('')
const isProcessing = ref(false)
const showUnbanConfirm = ref(false)
const userToUnban = ref('')
const userToUnbanName = ref('')

const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')

const roleOptions = computed(() => UserRoleValues.filter((role) => role !== UserRole.Banned))

async function updateRole(userId: string, newRole: string) {
  processingUser.value = userId
  try {
    const token = getCsrfToken()
    const response = await fetch(`/profile/update-user-role/${userId}/${newRole}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token || '',
      },
      body: JSON.stringify({ role: newRole }),
    })

    if (response.ok) {
      showNotification.value = true
      notificationMessage.value = 'Rôle mis à jour avec succès'
      notificationType.value = 'success'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
      router.reload({ only: ['allUsers'] })
    } else {
      showNotification.value = true
      notificationMessage.value = 'Une erreur est survenue lors de la mise à jour du rôle'
      notificationType.value = 'error'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    }
  } catch (error) {
    showNotification.value = true
    notificationMessage.value = 'Une erreur est survenue lors de la mise à jour du rôle'
    notificationType.value = 'error'
    setTimeout(() => {
      showNotification.value = false
    }, 5000)
  } finally {
    processingUser.value = ''
  }
}

function openBanConfirmModal(userId: string, userName: string) {
  userToBan.value = userId
  userToBanName.value = userName
  showConfirm.value = true
}

function closeConfirmModal() {
  showConfirm.value = false
  userToBan.value = ''
  userToBanName.value = ''
}

async function confirmBan() {
  if (!userToBan.value) return

  isProcessing.value = true
  processingUser.value = userToBan.value

  try {
    const token = getCsrfToken()
    const response = await fetch(`/profile/ban-user/${userToBan.value}/ban`, {
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
        showNotification.value = false
      }, 5000)
      router.reload({ only: ['allUsers'] })
    } else {
      showNotification.value = true
      notificationMessage.value = 'Un administrateur ne peut être banni'
      notificationType.value = 'error'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
      console.error("Erreur lors du bannissement de l'utilisateur")
    }
  } catch (error) {
    showNotification.value = true
    notificationMessage.value = 'Une erreur est survenue lors du bannissement de l\'utilisateur'
    notificationType.value = 'error'
    setTimeout(() => {
      showNotification.value = false
    }, 5000)
  } finally {
    isProcessing.value = false
    processingUser.value = ''
    closeConfirmModal()
  }
}

// Fonctions pour gérer le débannissement
function openUnbanConfirmModal(userId: string, userName: string) {
  userToUnban.value = userId
  userToUnbanName.value = userName
  showUnbanConfirm.value = true
}

function closeUnbanConfirmModal() {
  showUnbanConfirm.value = false
  userToUnban.value = ''
  userToUnbanName.value = ''
}

async function confirmUnban() {
  if (!userToUnban.value) return

  isProcessing.value = true
  processingUser.value = userToUnban.value

  try {
    const token = getCsrfToken()
    const response = await fetch(`/profile/unban-user/${userToUnban.value}/unban`, {
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
        showNotification.value = false
      }, 5000)
      router.reload({ only: ['allUsers'] })
    } else {
      showNotification.value = true
      notificationMessage.value = 'Une erreur est survenue lors du debannissement de l\'utilisateur'
      notificationType.value = 'error'
      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    }
  } catch (error) {
    showNotification.value = true
    notificationMessage.value = 'Une erreur est survenue lors du debannissement de l\'utilisateur'
    notificationType.value = 'error'
    setTimeout(() => {
      showNotification.value = false
    }, 5000)
  } finally {
    isProcessing.value = false
    processingUser.value = ''
    closeUnbanConfirmModal()
  }
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

    <p class="text-2xl font-semibold mb-4">Gestion des utilisateurs</p>

    <div class="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="max-h-96 overflow-y-auto custom-scrollbar">
          <table class="min-w-[1200px] w-full table-fixed">
            <thead class="bg-gray-100">
              <tr>
                <th class="sticky top-0 bg-gray-100 px-4 py-3 text-left font-semibold w-[200px]">
                  Prénom
                </th>
                <th class="sticky top-0 bg-gray-100 px-4 py-3 text-left font-semibold w-[200px]">
                  Nom
                </th>
                <th class="sticky top-0 bg-gray-100 px-4 py-3 text-left font-semibold w-[250px]">
                  Email
                </th>
                <th
                  class="sticky top-0 bg-gray-100 px-4 py-3 text-left font-semibold w-[100px] z-30"
                >
                  Rôle
                </th>
                <th
                  class="sticky top-0 bg-gray-100 px-4 py-3 text-left font-semibold w-[160px] z-30"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 cursor-default">
                <td class="px-4 py-3 text-gray-700 truncate">{{ user.firstName }}</td>
                <td class="px-4 py-3 text-gray-700 truncate">{{ user.lastName }}</td>
                <td class="px-4 py-3 text-gray-700 truncate">{{ user.email }}</td>
                <td class="px-4 py-3 text-gray-700">
                  <div class="flex items-center gap-2">
                    <!-- Badge pour utilisateur banni -->
                    <span
                      v-if="user.role === 'banned'"
                      class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400"
                    >
                      Banni
                    </span>

                    <!-- Menu de sélection du rôle -->
                    <Menu v-else as="div" class="relative">
                      <MenuButton
                        class="border border-gray-300 rounded px-3 py-1 text-sm font-medium bg-white shadow-sm hover:bg-gray-100 cursor-pointer"
                        :disabled="processingUser === user.id"
                      >
                        {{ user.role }}
                      </MenuButton>
                      <MenuItems
                        class="absolute z-50 mt-2 w-32 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                      >
                        <div class="py-1">
                          <MenuItem v-for="role in roleOptions" :key="role" v-slot="{ active }">
                            <button
                              @click="updateRole(user.id, role)"
                              class="group flex w-full items-center rounded-md px-4 py-2 text-sm"
                              :class="active ? 'bg-[#5C4741] text-white ' : 'text-gray-900'"
                            >
                              {{ role }}
                            </button>
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Menu>
                  </div>
                </td>

                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <!-- Si l'utilisateur est banni, afficher un bouton de débannissement -->
                    <button
                      v-if="user.role === 'banned'"
                      @click="openUnbanConfirmModal(user.id, `${user.firstName} ${user.lastName}`)"
                      :disabled="processingUser === user.id"
                      class="text-green-600 hover:opacity-75 disabled:opacity-50 cursor-pointer border border-green-500 rounded-md px-2 py-1 text-xs"
                    >
                      Débannir
                    </button>

                    <!-- Sinon afficher le bouton de ban -->
                    <button
                      v-else
                      @click="openBanConfirmModal(user.id, `${user.firstName} ${user.lastName}`)"
                      :disabled="processingUser === user.id"
                      :title="t('user.banUser')"
                      class="text-red-600 hover:opacity-75 disabled:opacity-50 cursor-pointer"
                    >
                      <BanIcon class="w-5 h-5" />
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

  <!-- Modal de confirmation pour le bannissement -->
  <teleport to="body">
    <TransitionRoot appear :show="showConfirm" as="template">
      <Dialog as="div" @close="closeConfirmModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Confirmer le bannissement
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir bannir l'utilisateur
                    <span class="font-semibold">{{ userToBanName }}</span> ? Cette action empêchera
                    l'utilisateur d'accéder à la plateforme.
                  </p>
                </div>

                <div class="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none"
                    @click="closeConfirmModal"
                    :disabled="isProcessing"
                  >
                    {{ t('common.cancel') }}
                  </button>
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                    @click="confirmBan"
                    :disabled="isProcessing"
                  >
                    <span v-if="isProcessing" class="inline-block animate-spin mr-2">↻</span>
                    {{ t('common.ban') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>

  <!-- Modal de confirmation pour le débannissement -->
  <teleport to="body">
    <TransitionRoot appear :show="showUnbanConfirm" as="template">
      <Dialog as="div" @close="closeUnbanConfirmModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Confirmer le débannissement
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir débannir l'utilisateur
                    <span class="font-semibold">{{ userToUnbanName }}</span> ?
                    Cette action permettra à l'utilisateur d'accéder à nouveau à la plateforme.
                  </p>
                </div>

                <div class="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none"
                    @click="closeUnbanConfirmModal"
                    :disabled="isProcessing"
                  >
                    {{ t('common.cancel') }}
                  </button>
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
                    @click="confirmUnban"
                    :disabled="isProcessing"
                  >
                    <span v-if="isProcessing" class="inline-block animate-spin mr-2">↻</span>
                    Débannir
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>
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
