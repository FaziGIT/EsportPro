<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useI18n } from '../../resources/js/composables/useI18n'
import { ref, watch } from 'vue'

const { t } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirmer la suppression',
  },
  confirmMessage: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  warningMessage: {
    type: String,
    default: '',
  },
  isDeleting: {
    type: Boolean,
    default: false,
  },
  needReload: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  success: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'confirm'])

const shouldDisableCancel = ref(false)

// Désactiver le bouton d'annulation pendant la suppression
watch(() => props.isDeleting, (isDeleting) => {
  shouldDisableCancel.value = isDeleting
})

// Surveiller le succès pour fermer automatiquement et recharger la page
watch(() => props.success, (newSuccess) => {
  if (newSuccess) {
    // Désactiver le bouton d'annulation quand on a un succès
    shouldDisableCancel.value = true

    // Fermeture automatique
    setTimeout(() => {
      emit('close')
      if(props.needReload) {
        window.location.reload()
      }
    }, 1500)
  }
})

const handleConfirm = () => {
  emit('confirm')
}

const handleClose = () => {
  if (!props.isDeleting && !props.success) {
    emit('close')
  }
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-50">
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
                {{ title }}
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ confirmMessage }}
                </p>
                <p class="mt-2 font-medium">{{ itemName }}</p>
                <p v-if="warningMessage" class="mt-2 text-sm text-red-600 font-medium">
                  {{ warningMessage }}
                </p>

                <div
                  v-if="error"
                  class="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
                >
                  {{ error }}
                </div>

                <div
                  v-if="success"
                  class="mt-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm"
                >
                  {{ success }}
                </div>
              </div>

              <div class="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="handleClose"
                  :disabled="shouldDisableCancel"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="handleConfirm"
                  :disabled="isDeleting"
                >
                  <span v-if="isDeleting" class="inline-block animate-spin mr-2">↻</span>
                  {{ t('common.delete') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
