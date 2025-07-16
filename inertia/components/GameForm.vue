<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch, onUnmounted } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { useI18n } from '../../resources/js/composables/useI18n'
import { GamePlatform } from '#enums/game_platform'
import { GameFormData, GameStatus } from '#types/game'
import Game from '#models/game'
import { TournamentStatus } from '#types/tournament'

const { t } = useI18n()

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
  },
  mode: {
    type: String as () => typeof TournamentStatus.EDIT | typeof TournamentStatus.NEW,
  },
  game: {
    type: Object as () => Game | null,
    default: null,
  },
  needReload: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'submit'])

// State
const activeTab = ref('general')
const imageInput = ref<HTMLInputElement>()
const imageLoadError = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')
const processingForm = ref(false)

// Initialize form data based on mode
const initializeFormData = (): GameFormData => {
  if (props.mode === GameStatus.EDIT && props.game) {
    const game = props.game

    return {
      name: game.name || '',
      platform: game.platform || GamePlatform.PC,
      image: null,
      imagePreview: game.id ? `/games/${game.id}/image` : '',
    }
  } else {
    return {
      name: '',
      platform: GamePlatform.PC,
      image: null,
      imagePreview: '',
    }
  }
}

const form = useForm<GameFormData>(initializeFormData())

const modalTitle = computed(() => {
  return props.mode === GameStatus.EDIT ? t('game.editGame') : t('game.newGame')
})

const submitButtonText = computed(() => {
  return props.mode === GameStatus.EDIT ? t('game.update') : t('game.save')
})

const closeModal = () => {
  emit('close')
}

const submitForm = () => {
  form.clearErrors()
  processingForm.value = true

  const imagePreview = form.imagePreview
  form.imagePreview = ''

  const submitUrl = props.mode === GameStatus.EDIT ? `/games/${props.game?.id}/edit` : '/games/new'

  const method = props.mode === GameStatus.EDIT ? 'put' : 'post'

  form[method](submitUrl, {
    forceFormData: true,
    headers: {
      Accept: 'application/json',
    },
    preserveScroll: true,
    preserveState: true,
    onSuccess: () => {
      notificationType.value = 'success'
      notificationMessage.value =
        props.mode === GameStatus.EDIT ? t('game.updateSuccess') : t('game.creationSuccess')
      showNotification.value = true

      setTimeout(() => {
        emit('close')
        if (props.mode === TournamentStatus.EDIT && props.needReload) {
          window.location.reload()
        }
      }, 3000)
    },
    onError: (errors) => {
      form.imagePreview = imagePreview
      if (errors.status === '403') {
        notificationType.value = 'error'
        notificationMessage.value = t('game.unauthorizedUpdate')
        showNotification.value = true
      } else {
        notificationType.value = 'error'
        notificationMessage.value =
          props.mode === GameStatus.EDIT ? t('game.updateError') : t('game.creationError')
        showNotification.value = true
      }

      setTimeout(() => {
        showNotification.value = false
      }, 5000)
    },
    onFinish: () => {
      processingForm.value = false
      if (!form.imagePreview) {
        form.imagePreview = imagePreview
      }
    },
  })
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]

  form.image = file
  imageLoadError.value = false

  // Create preview
  const reader = new FileReader()
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const result = e.target?.result
    form.imagePreview = typeof result === 'string' ? result : ''
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  form.image = null
  form.imagePreview = ''
  imageLoadError.value = false
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const getTabOffset = () => {
  switch (activeTab.value) {
    case 'general':
      return 0
    case 'image':
      return 100
    default:
      return 0
  }
}

const getError = (fieldName: string) => {
  return (form.errors as any)[fieldName]
}

const hasError = (fieldName: string) => {
  return !!(form.errors as any)[fieldName]
}

watch(
  () => props.game,
  () => {
    if (props.mode === GameStatus.EDIT && props.game) {
      const newData = initializeFormData()
      Object.keys(newData).forEach((key) => {
        ;(form as any)[key] = (newData as any)[key]
      })
      imageLoadError.value = false
    }
  },
  { deep: true }
)

function handleEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      document.addEventListener('keydown', handleEscapeKey)
    } else {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<template>
  <!-- Modal only renders when isOpen is true -->
  <div v-if="isOpen">
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

    <!-- Modal overlay with transition -->
    <Transition name="modal-overlay">
      <div
        class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click="closeModal"
        @keydown.enter.stop
      >
        <!-- Modal content with transition -->
        <Transition name="modal-content" appear>
          <div
            class="bg-white rounded-lg shadow-xl w-full max-w-[600px] h-[500px] sm:h-[500px] max-h-[90vh] flex flex-col transform mx-auto"
            @click.stop
            @keydown.enter="submitForm"
            tabindex="-1"
          >
            <!-- Modal header -->
            <div
              class="flex justify-between items-center p-3 border-b border-gray-200 bg-[#CBD3CD]"
            >
              <div class="flex-1"></div>
              <h2 class="text-xl font-semibold text-gray-800 text-center flex-1">
                {{ modalTitle }}
              </h2>
              <div class="flex-1 flex justify-end">
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 relative">
              <nav class="flex relative">
                <button
                  @click="activeTab = 'general'"
                  :class="[
                    'py-3 px-6 text-sm font-medium transition-colors relative z-10 flex-1',
                    activeTab === 'general' ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700',
                  ]"
                >
                  {{ t('game.generalInformation') }}
                </button>
                <button
                  @click="activeTab = 'image'"
                  :class="[
                    'py-3 px-6 text-sm font-medium transition-colors relative z-10 flex-1',
                    activeTab === 'image' ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700',
                  ]"
                >
                  {{ t('game.image') }}
                </button>
              </nav>
              <!-- Animated underline -->
              <div
                class="absolute bottom-0 h-0.5 bg-gray-800 transition-all duration-300 ease-in-out"
                :style="{
                  width: '50%',
                  transform: `translateX(${getTabOffset()}%)`,
                }"
              ></div>
            </div>

            <!-- Tab content -->
            <div class="p-6 flex-1 overflow-y-auto">
              <Transition name="tab-content" mode="out-in">
                <!-- General Information Tab -->
                <div v-if="activeTab === 'general'" key="general" class="space-y-6">
                  <!-- Game name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                      {{ t('game.gameName') }}
                    </label>
                    <input
                      v-model="form.name"
                      type="text"
                      :class="[
                        'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                        hasError('name')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500',
                      ]"
                      :placeholder="t('game.gameNamePlaceholder')"
                    />
                    <div v-if="hasError('name')" class="mt-1 text-sm text-red-600">
                      {{ getError('name') }}
                    </div>
                  </div>

                  <!-- Platform -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                      {{ t('game.platform') }}
                    </label>
                    <div class="relative">
                      <select
                        v-model="form.platform"
                        :class="[
                          'w-full px-3 py-2 bg-gray-100 border rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2',
                          hasError('platform')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500',
                        ]"
                      >
                        <option value="PC">PC</option>
                        <option value="PS4">PlayStation 4</option>
                        <option value="PS5">PlayStation 5</option>
                        <option value="XBOX">Xbox</option>
                        <option value="SWITCH">Nintendo Switch</option>
                      </select>
                      <div
                        class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
                      >
                        <svg
                          class="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div v-if="hasError('platform')" class="mt-1 text-sm text-red-600">
                      {{ getError('platform') }}
                    </div>
                  </div>
                </div>

                <!-- Image Tab -->
                <div v-else-if="activeTab === 'image'" key="image" class="space-y-6">
                  <!-- Upload section -->
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700 font-altone">
                      {{ t('game.addGameImage') }}
                    </span>
                    <button
                      @click="triggerImageUpload"
                      :class="[
                        'px-4 py-2 text-white text-sm font-medium rounded-md transition-colors',
                        hasError('image')
                          ? 'bg-red-600 hover:bg-red-700 border border-red-500'
                          : 'bg-[#5C4741] hover:bg-[#4a3a35]',
                      ]"
                    >
                      {{ t('game.import') }}
                    </button>
                  </div>

                  <!-- Error message for image -->
                  <div v-if="hasError('image')" class="text-sm text-red-600">
                    {{ getError('image') }}
                  </div>

                  <!-- Hidden file input -->
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    class="hidden"
                    @change="handleImageUpload"
                  />

                  <!-- Image preview area -->
                  <div
                    :class="[
                      'border-2 border-dashed rounded-lg p-8',
                      hasError('image') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50',
                    ]"
                  >
                    <!-- Selected image preview -->
                    <div
                      v-if="form.imagePreview && !imageLoadError"
                      class="relative w-full h-48 rounded-lg overflow-hidden"
                    >
                      <img
                        :src="form.imagePreview"
                        alt="Selected Image"
                        class="w-full h-full object-cover rounded-lg"
                        @error="imageLoadError = true"
                      />
                      <button
                        @click="removeImage"
                        class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <svg
                          class="w-5 h-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>

                    <!-- No image placeholder -->
                    <div v-else class="flex flex-col items-center justify-center h-48">
                      <svg
                        class="w-16 h-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <p class="text-gray-500 text-sm">
                        {{
                          props.mode === GameStatus.EDIT && props.game?.id
                            ? t('game.currentImage')
                            : t('game.noImageSelected')
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Modal footer -->
            <div class="flex justify-end p-3 border-t border-gray-200 bg-[#F9FAFB]">
              <button
                @click="closeModal"
                class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded-md transition-colors cursor-pointer"
                :disabled="processingForm"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                @click="submitForm"
                class="ml-3 px-4 py-2 bg-[#5C4741] hover:bg-[#7b5f57] text-white text-sm font-medium rounded-md transition-colors cursor-pointer relative"
                :disabled="processingForm"
              >
                <span
                  v-if="processingForm"
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <svg
                    class="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
                <span :class="{ 'opacity-0': processingForm }">{{ submitButtonText }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Modal overlay transitions - smooth backdrop fade */
.modal-overlay-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-overlay-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-overlay-enter-to,
.modal-overlay-leave-from {
  opacity: 1;
  backdrop-filter: blur(4px);
}

/* Modal content transitions - smooth scale and fade with bounce */
.modal-content-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.modal-content-enter-to,
.modal-content-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Tab content transitions - smooth slide and fade */
.tab-content-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-content-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.tab-content-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.tab-content-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.tab-content-enter-to,
.tab-content-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Ensure smooth backdrop blur transition */
.modal-overlay-enter-active .backdrop-blur-sm,
.modal-overlay-leave-active .backdrop-blur-sm {
  transition: backdrop-filter 0.3s ease;
}
</style>
