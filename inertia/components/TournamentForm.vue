<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { useI18n } from '../../resources/js/composables/useI18n'
import { TierType } from '#enums/tier_type'
import { FormatType } from '#enums/format_type'
import { TournamentFormData, TournamentStatus } from '#types/tournament'
import { DateTime } from 'luxon'
import Tournament from '#models/tournament'

const { t } = useI18n()

// Props
const props = defineProps<{
  isOpen: boolean
  mode: typeof TournamentStatus.EDIT | typeof TournamentStatus.NEW
  tournament?: Tournament
  games: Array<{
    id: string
    name: string
  }>
}>()

// Emits
const emit = defineEmits(['close', 'submit'])

// State
const activeTab = ref('general')
const imageInput = ref<HTMLInputElement>()
const imageLoadError = ref(false)

// Initialize form data based on mode
const initializeFormData = (): TournamentFormData => {
  if (props.mode === TournamentStatus.EDIT && props.tournament) {
    const tournament = props.tournament

    const formatDateForInput = (date: string): string | null => {
      if (!date) return null

      try {
        const luxonDate = DateTime.fromISO(date)

        return luxonDate.toFormat("yyyy-MM-dd'T'HH:mm")
      } catch (error) {
        console.error('Error formatting date:', error)
        return null
      }
    }

    return {
      name: tournament.name || '',
      tier: tournament.tier || TierType.Beginner,
      format: tournament.format || FormatType.BO1,
      price: tournament.price || 0,
      rules: tournament.rules || '',
      numberParticipants: tournament.numberParticipants || 0,
      numberPlayersPerTeam: tournament.numberPlayersPerTeam || null,
      region: tournament.region || null,
      address: tournament.address || null,
      city: tournament.city || null,
      country: tournament.country || null,
      postalCode: tournament.postalCode || null,
      startDate: formatDateForInput(String(tournament.startDate)) as DateTime | null,
      endDate: formatDateForInput(String(tournament.endDate)) as DateTime | null,
      gameId: tournament.gameId || '',
      isOnline: tournament.region === null,
      teamMode: tournament.numberPlayersPerTeam !== null,
      image: null,
      imagePreview: tournament.id ? `/tournaments/${tournament.id}/image` : '',
    }
  } else {
    return {
      name: '',
      tier: TierType.Beginner,
      format: FormatType.BO1,
      price: 0,
      rules: '',
      numberParticipants: 0,
      numberPlayersPerTeam: null,
      region: null,
      address: null,
      city: null,
      country: null,
      postalCode: null,
      startDate: null,
      endDate: null,
      gameId: '',
      isOnline: true,
      teamMode: false,
      image: null,
      imagePreview: '',
    }
  }
}

const form = useForm<TournamentFormData>(initializeFormData())

const modalTitle = computed(() => {
  return props.mode === TournamentStatus.EDIT
    ? t('tournament.editTournament')
    : t('tournament.newTournament')
})

const submitButtonText = computed(() => {
  return props.mode === TournamentStatus.EDIT ? t('tournament.update') : t('tournament.save')
})

const closeModal = () => {
  emit('close')
}

const submitForm = () => {
  form.clearErrors()

  const imagePreview = form.imagePreview
  form.imagePreview = ''

  const submitUrl =
    props.mode === TournamentStatus.EDIT
      ? `/tournaments/${props.tournament?.id}/edit`
      : '/tournaments/new'

  const method = props.mode === TournamentStatus.EDIT ? 'put' : 'post'

  form[method](submitUrl, {
    forceFormData: true,
    onSuccess: () => {
      emit('close')
      window.location.reload()
    },
    onError: () => {
      form.imagePreview = imagePreview
    },
    onFinish: () => {
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
    case 'players':
      return 100
    case 'image':
      return 200
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
  () => form.isOnline,
  (newValue) => {
    if (newValue) {
      form.region = null
      form.address = null
      form.city = null
      form.country = null
      form.postalCode = null
    }
  }
)

watch(
  () => form.teamMode,
  (newValue) => {
    if (!newValue) {
      form.numberPlayersPerTeam = null
    } else if (form.numberPlayersPerTeam === null) {
      form.numberPlayersPerTeam = 5
    }
  }
)

// Reset form when tournament data changes (for edit mode)
watch(
  () => props.tournament,
  () => {
    if (props.mode === TournamentStatus.EDIT && props.tournament) {
      const newData = initializeFormData()
      Object.keys(newData).forEach((key) => {
        ;(form as any)[key] = (newData as any)[key]
      })
      imageLoadError.value = false
    }
  },
  { deep: true }
)
</script>

<template>
  <!-- Modal only renders when isOpen is true -->
  <div v-if="isOpen">
    <!-- Modal overlay with transition -->
    <Transition name="modal-overlay">
      <div
        class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click="closeModal"
      >
        <!-- Modal content with transition -->
        <Transition name="modal-content" appear>
          <div
            class="bg-white rounded-lg shadow-xl w-full max-w-[800px] h-[600px] sm:h-[600px] max-h-[90vh] flex flex-col transform mx-auto"
            @click.stop
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
                  {{ t('tournament.generalInformation') }}
                </button>
                <button
                  @click="activeTab = 'players'"
                  :class="[
                    'py-3 px-6 text-sm font-medium transition-colors relative z-10 flex-1',
                    activeTab === 'players' ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700',
                  ]"
                >
                  {{ t('tournament.playersAndAddresses') }}
                </button>
                <button
                  @click="activeTab = 'image'"
                  :class="[
                    'py-3 px-6 text-sm font-medium transition-colors relative z-10 flex-1',
                    activeTab === 'image' ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700',
                  ]"
                >
                  {{ t('tournament.image') }}
                </button>
              </nav>
              <!-- Animated underline -->
              <div
                class="absolute bottom-0 h-0.5 bg-gray-800 transition-all duration-300 ease-in-out"
                :style="{
                  width: '33.333%',
                  transform: `translateX(${getTabOffset()}%)`,
                }"
              ></div>
            </div>

            <!-- Tab content -->
            <div class="p-6 flex-1 overflow-y-auto">
              <Transition name="tab-content" mode="out-in">
                <!-- General Information Tab -->
                <div v-if="activeTab === 'general'" key="general" class="space-y-6">
                  <!-- Tournament name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                      Nom du tournoi
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
                      placeholder="Nom de votre tournoi"
                    />
                    <div v-if="hasError('name')" class="mt-1 text-sm text-red-600">
                      {{ getError('name') }}
                    </div>
                  </div>

                  <!-- First row with three dropdowns -->
                  <div class="grid grid-cols-3 gap-4">
                    <!-- Game choice -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.gameChoice') }}
                      </label>
                      <div class="relative">
                        <select
                          v-model="form.gameId"
                          :class="[
                            'w-full px-3 py-2 bg-gray-100 border rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2',
                            hasError('gameId')
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500',
                          ]"
                        >
                          <option value="">Sélectionner un jeu</option>
                          <option v-for="game in props.games" :key="game.id" :value="game.id">
                            {{ game.name }}
                          </option>
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
                      <div v-if="hasError('gameId')" class="mt-1 text-sm text-red-600">
                        {{ getError('gameId') }}
                      </div>
                    </div>

                    <!-- Tier (Level) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.level') }}
                      </label>
                      <div class="relative">
                        <select
                          v-model="form.tier"
                          :class="[
                            'w-full px-3 py-2 bg-gray-100 border rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2',
                            hasError('tier')
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500',
                          ]"
                        >
                          <option value="beginner">{{ t('tournament.beginners') }}</option>
                          <option value="intermediate">{{ t('tournament.intermediate') }}</option>
                          <option value="advanced">{{ t('tournament.advanced') }}</option>
                          <option value="pro">{{ t('tournament.professional') }}</option>
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
                      <div v-if="hasError('tier')" class="mt-1 text-sm text-red-600">
                        {{ getError('tier') }}
                      </div>
                    </div>

                    <!-- Tournament format -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.tournamentFormat') }}
                      </label>
                      <div class="relative">
                        <select
                          v-model="form.format"
                          :class="[
                            'w-full px-3 py-2 bg-gray-100 border rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2',
                            hasError('format')
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500',
                          ]"
                        >
                          <option value="BO1">BO1</option>
                          <option value="BO2">BO2</option>
                          <option value="BO3">BO3</option>
                          <option value="BO4">BO4</option>
                          <option value="BO5">BO5</option>
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
                      <div v-if="hasError('format')" class="mt-1 text-sm text-red-600">
                        {{ getError('format') }}
                      </div>
                    </div>
                  </div>

                  <!-- Prize and Dates row -->
                  <div class="grid grid-cols-3 gap-4">
                    <!-- Prize -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.prize') }}
                      </label>
                      <input
                        v-model.number="form.price"
                        type="number"
                        min="0"
                        :class="[
                          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                          hasError('price')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500',
                        ]"
                        placeholder="1000"
                      />
                      <div v-if="hasError('price')" class="mt-1 text-sm text-red-600">
                        {{ getError('price') }}
                      </div>
                    </div>

                    <!-- Start date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.startDate') }}
                      </label>
                      <input
                        v-model="form.startDate"
                        type="datetime-local"
                        :class="[
                          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                          hasError('startDate')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500',
                        ]"
                      />
                      <div v-if="hasError('startDate')" class="mt-1 text-sm text-red-600">
                        {{ getError('startDate') }}
                      </div>
                    </div>

                    <!-- End date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.endDate') }}
                      </label>
                      <input
                        v-model="form.endDate"
                        type="datetime-local"
                        :class="[
                          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                          hasError('endDate')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500',
                        ]"
                      />
                      <div v-if="hasError('endDate')" class="mt-1 text-sm text-red-600">
                        {{ getError('endDate') }}
                      </div>
                    </div>
                  </div>

                  <!-- Rules -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                      {{ t('tournament.rules') }}
                    </label>
                    <textarea
                      v-model="form.rules"
                      rows="8"
                      :class="[
                        'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none',
                        hasError('rules')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500',
                      ]"
                      :placeholder="t('tournament.tournamentRulesPlaceholder')"
                    ></textarea>
                    <div v-if="hasError('rules')" class="mt-1 text-sm text-red-600">
                      {{ getError('rules') }}
                    </div>
                  </div>
                </div>

                <!-- Players and Addresses Tab -->
                <div v-else-if="activeTab === 'players'" key="players" class="space-y-6">
                  <!-- Number of participants -->
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-4">
                      <label class="text-sm font-medium text-gray-700 font-altone">
                        {{ t('tournament.numberOfParticipants') }}
                      </label>
                      <input
                        v-model.number="form.numberParticipants"
                        type="number"
                        min="1"
                        max="128"
                        :class="[
                          'w-20 px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2',
                          hasError('numberParticipants')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500',
                        ]"
                      />
                    </div>
                    <div v-if="hasError('numberParticipants')" class="text-sm text-red-600">
                      {{ getError('numberParticipants') }}
                    </div>
                  </div>

                  <!-- Team mode toggle -->
                  <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-gray-700 font-altone">
                      {{ t('tournament.teamMode') }}
                    </label>
                    <div class="relative">
                      <input v-model="form.teamMode" type="checkbox" class="sr-only" />
                      <div
                        @click="form.teamMode = !form.teamMode"
                        :class="[
                          'block w-10 h-6 rounded-full cursor-pointer transition-colors',
                          form.teamMode ? 'bg-blue-600' : 'bg-gray-300',
                        ]"
                      >
                        <div
                          :class="[
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                            form.teamMode ? 'transform translate-x-5' : 'transform translate-x-1',
                          ]"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Number of players per team (only shown if team mode is on) -->
                  <div v-if="form.teamMode" class="flex items-center gap-4">
                    <label class="text-sm font-medium text-gray-700 font-altone">
                      {{ t('tournament.playersPerTeam') }}
                    </label>
                    <input
                      v-model.number="form.numberPlayersPerTeam"
                      type="number"
                      min="1"
                      max="10"
                      :class="[
                        'w-20 px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2',
                        hasError('numberPlayersPerTeam')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500',
                      ]"
                      placeholder="5"
                    />
                    <div v-if="hasError('numberPlayersPerTeam')" class="mt-1 text-sm text-red-600">
                      {{ getError('numberPlayersPerTeam') }}
                    </div>
                  </div>

                  <!-- Separator line -->
                  <hr class="border-gray-300" />

                  <!-- Online mode toggle -->
                  <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-gray-700 font-altone">
                      {{ t('tournament.online') }}
                    </label>
                    <div class="relative">
                      <input v-model="form.isOnline" type="checkbox" class="sr-only" />
                      <div
                        @click="form.isOnline = !form.isOnline"
                        :class="[
                          'block w-10 h-6 rounded-full cursor-pointer transition-colors',
                          form.isOnline ? 'bg-blue-600' : 'bg-gray-300',
                        ]"
                      >
                        <div
                          :class="[
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                            form.isOnline ? 'transform translate-x-5' : 'transform translate-x-1',
                          ]"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Tournament address section -->
                  <div v-if="!form.isOnline" class="space-y-4">
                    <!-- Region -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.region') }}
                      </label>
                      <input
                        v-model="form.region"
                        type="text"
                        :class="[
                          'w-full px-3 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-2',
                          hasError('region')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500',
                        ]"
                        :placeholder="t('tournament.regionPlaceholder')"
                      />
                      <div v-if="hasError('region')" class="mt-1 text-sm text-red-600">
                        {{ getError('region') }}
                      </div>
                    </div>

                    <!-- Address -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.tournamentAddress') }}
                      </label>
                      <input
                        v-model="form.address"
                        type="text"
                        :class="[
                          'w-full px-3 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-2',
                          hasError('address')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500',
                        ]"
                        :placeholder="t('tournament.addressPlaceholder')"
                      />
                      <div v-if="hasError('address')" class="mt-1 text-sm text-red-600">
                        {{ getError('address') }}
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <!-- City -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                          {{ t('tournament.city') }}
                        </label>
                        <input
                          v-model="form.city"
                          type="text"
                          :class="[
                            'w-full px-3 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-2',
                            hasError('city')
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500',
                          ]"
                          :placeholder="t('tournament.cityPlaceholder')"
                        />
                        <div v-if="hasError('city')" class="mt-1 text-sm text-red-600">
                          {{ getError('city') }}
                        </div>
                      </div>

                      <!-- Postal Code -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                          {{ t('tournament.postalCode') }}
                        </label>
                        <input
                          v-model="form.postalCode"
                          type="text"
                          :class="[
                            'w-full px-3 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-2',
                            hasError('postalCode')
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500',
                          ]"
                          :placeholder="t('tournament.postalCodePlaceholder')"
                        />
                        <div v-if="hasError('postalCode')" class="mt-1 text-sm text-red-600">
                          {{ getError('postalCode') }}
                        </div>
                      </div>
                    </div>

                    <!-- Country -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2 font-altone">
                        {{ t('tournament.country') }}
                      </label>
                      <input
                        v-model="form.country"
                        type="text"
                        :class="[
                          'w-full px-3 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-2',
                          hasError('country')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500',
                        ]"
                        :placeholder="t('tournament.countryPlaceholder')"
                      />
                      <div v-if="hasError('country')" class="mt-1 text-sm text-red-600">
                        {{ getError('country') }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Image Tab -->
                <div v-else-if="activeTab === 'image'" key="image" class="space-y-6">
                  <!-- Upload section -->
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700 font-altone">
                      {{ t('tournament.addBackgroundImage') }}
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
                      {{ t('tournament.import') }}
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
                          props.mode === TournamentStatus.EDIT && props.tournament?.image
                            ? t('tournament.currentImage')
                            : t('tournament.noImageSelected')
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
              >
                {{ t('tournament.cancel') }}
              </button>
              <button
                @click="submitForm"
                class="ml-3 px-4 py-2 bg-[#5C4741] hover:bg-[#7b5f57] text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
              >
                {{ submitButtonText }}
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
