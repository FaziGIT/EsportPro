<script setup lang="ts">
import EditSVG from '~/components/icons/EditSVG.vue'
import Button from '~/components/Button.vue'
import User from '#models/user'
import { defineProps, ref, watch } from 'vue'
import { Link, router, useForm } from '@inertiajs/vue3'
import UserInfoField from '~/components/UserInfoField.vue'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { TrashIcon } from '~/components/icons'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

const { t } = useI18n()
const props = defineProps({
  user: {
    type: Object as () => User,
    required: true,
  },
})

const isPublic = ref(!props.user!.isPrivate)
const showConfirm = ref(false)
const pendingValue = ref(isPublic.value)
const editing = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')
const isProcessing = ref(false)
const showDeleteAccountModal = ref(false)
const isProcessingDelete = ref(false)

const form = useForm({
  firstName: props.user!.firstName || '',
  lastName: props.user!.lastName || '',
})

const originalFirstName = ref(props.user!.firstName)
const originalLastName = ref(props.user!.lastName)

const onSwitchClick = () => {
  pendingValue.value = !isPublic.value
  showConfirm.value = true
}

const confirmChange = async () => {
  isProcessing.value = true

  try {
    await router.post(
      '/profile/privacy',
      {
        isPrivate: !pendingValue.value,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          isPublic.value = pendingValue.value
          showConfirm.value = false
          notificationType.value = 'success'
          notificationMessage.value = t('profile.updateStatusSuccess')
          showNotification.value = true
          setTimeout(() => {
            showNotification.value = false
          }, 3000)
        },
        onError: () => {
          notificationType.value = 'error'
          notificationMessage.value = t('profile.updateStatusError')
          showNotification.value = true
          setTimeout(() => {
            showNotification.value = false
          }, 3000)
        },
      }
    )
  } finally {
    isProcessing.value = false
  }
}

const closeConfirmModal = () => {
  showConfirm.value = false
}

// Gestion de la mise à jour des données utilisateur
const updateData = async () => {
  if (form.processing) return

  await form.post('/profile/update-data', {
    preserveScroll: true,
    onSuccess: () => {
      originalFirstName.value = form.firstName
      originalLastName.value = form.lastName
      editing.value = false

      notificationType.value = 'success'
      notificationMessage.value = t('profile.updateSuccess')
      showNotification.value = true

      router.reload({ only: ['profile'] })

      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    },
    onError: () => {
      notificationType.value = 'error'
      notificationMessage.value = t('profile.updateError')
      showNotification.value = true

      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    },
  })
}

const switchEditMode = () => {
  if (editing.value) {
    cancelEdit()
  } else {
    editing.value = true
  }
}

const cancelEdit = () => {
  form.firstName = originalFirstName.value || ''
  form.lastName = originalLastName.value || ''
  form.clearErrors()
  editing.value = false
}

const openDeleteModal = () => {
  showDeleteAccountModal.value = true
}

const closeDeleteModal = () => {
  showDeleteAccountModal.value = false
}

const deleteAccount = () => {
  isProcessingDelete.value = true
  router.delete('/profile/delete-account', {
    onSuccess: () => {},
    onError: () => {
      isProcessingDelete.value = false
      closeDeleteModal()
    },
  })
}

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.firstName = newUser.firstName || ''
      form.lastName = newUser.lastName || ''
      originalFirstName.value = newUser.firstName
      originalLastName.value = newUser.lastName
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="flex justify-between items-center pt-12 pb-4">
    <p class="text-2xl font-semibold">{{ t('profile.generalInfo') }}</p>
    <button @click="switchEditMode" class="hover:opacity-70 cursor-pointer">
      <EditSVG class="w-6 h-6" />
    </button>
  </div>

  <!-- Notification -->
  <div
    v-if="showNotification"
    class="fixed top-4 right-4 z-[60] px-4 py-3 rounded flex items-center shadow-lg max-w-md"
    :class="
      notificationType === 'success'
        ? 'bg-green-100 border border-green-400 text-green-700'
        : 'bg-red-100 border border-red-400 text-red-700'
    "
  >
    <span>{{ notificationMessage }}</span>
    <button
      @click="showNotification = false"
      class="ml-auto hover:opacity-70 cursor-pointer"
      :class="notificationType === 'success' ? 'text-green-500' : 'text-red-500'"
    >
      ✕
    </button>
  </div>

  <div class="bg-[#CBD3CD] rounded-md flex flex-wrap justify-start">
    <div class="p-8 flex flex-col gap-3 w-full md:w-1/3">
      <UserInfoField
        class="pb-2"
        :label="t('profile.lastName')"
        :value="form.firstName"
        :isEditable="editing"
        :error="form.errors.firstName"
        @update:value="form.firstName = $event"
      />
      <UserInfoField
        :label="t('profile.firstName')"
        :value="form.lastName"
        :isEditable="editing"
        :error="form.errors.lastName"
        @update:value="form.lastName = $event"
      />
    </div>
    <div class="p-8 flex flex-col gap-3 w-full md:w-1/3">
      <UserInfoField class="pb-2" :label="t('profile.username')" :value="user!.pseudo" />
      <UserInfoField :label="t('profile.email')" :value="user!.email" />
    </div>
    <div class="p-8 flex flex-col gap-3 w-full md:w-1/3">
      <div class="flex flex-wrap">
        <p class="pr-4">{{ t('profile.isPublic') }}</p>
        <button
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer border',
            isPublic ? 'bg-[#D6B7B0] border-[#D6B7B0]' : 'bg-white border-[#D6B7B0]',
          ]"
          @click="onSwitchClick"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full transition-transform cursor-pointer',
              isPublic ? 'bg-white translate-x-6' : 'bg-[#D6B7B0] translate-x-1',
            ]"
          />
        </button>
      </div>
      <Link
        href="/logout"
        method="post"
        :title="t('auth.logout')"
        class="px-9 py-2 mt-2 text-white bg-[#5C4741] text-base font-bold rounded-md cursor-pointer max-w-fit"
      >
        {{ t('auth.logout') }}
      </Link>
      <button
        @click="openDeleteModal"
        :title="t('profile.deleteAccount')"
        class="text-red-600 hover:underline font-medium flex items-center cursor-pointer mt-2"
        type="button"
      >
        {{ t('profile.deleteAccount') }}
        <TrashIcon class="w-5 h-5 ml-1" />
      </button>
    </div>
  </div>

  <div v-if="editing" class="mt-2 flex gap-3">
    <Button
      @click="updateData"
      :use-redirection="false"
      :loading="form.processing"
      :value="t('common.save')"
    />
    <Button
      @click="cancelEdit"
      :use-redirection="false"
      color="#D6B7B0"
      text-color="#000000"
      :value="t('common.cancel')"
    />
  </div>

  <!-- Modal de confirmation pour le changement de statut public/privé -->
  <ConfirmationModal
    :isOpen="showConfirm"
    :title="t('common.confirmChange')"
    :confirmMessage="t(pendingValue ? 'profile.confirmMakePublic' : 'profile.confirmMakePrivate')"
    :isProcessing="isProcessing"
    :confirmButtonText="t('common.confirm')"
    :confirmButtonColor="'bg-[#5C4741] hover:bg-[#7b5f57]'"
    @close="closeConfirmModal"
    @confirm="confirmChange"
  />

  <!-- Modal de confirmation pour la suppression de compte -->
  <ConfirmationModal
    :isOpen="showDeleteAccountModal"
    :title="t('profile.confirmDeleteAccount')"
    :confirmMessage="t('profile.deleteAccountWarning')"
    :warningMessage="t('profile.deleteAccountIrreversible')"
    :isProcessing="isProcessingDelete"
    :confirmButtonText="t('profile.confirmDelete')"
    @close="closeDeleteModal"
    @confirm="deleteAccount"
  />
</template>
