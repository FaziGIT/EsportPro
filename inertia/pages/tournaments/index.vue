<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import { onMounted, ref, watch } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useInfiniteScroll } from '@vueuse/core'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { useAuth } from '../../../resources/js/composables/useAuth'
import Tournament from '#models/tournament'
import TournamentCard from '~/components/TournamentCard.vue'
import { ChevronDown } from '~/components/icons'
import TournamentForm from '~/components/TournamentForm.vue'
import Game from '#models/game'
import { TournamentStatus } from '#types/tournament'
import { FilterOptions } from '#enums/filter'
import { OptionType } from '#types/option'

const { t } = useI18n()
const { user } = useAuth()

// Props from controller
const props = defineProps<{
  games?: Game[]
}>()

const tournaments = ref<Tournament[]>([])
const page = ref(1)
const loading = ref(false)
const allLoaded = ref(false)

const selectedFilter = ref(FilterOptions.ASC_DATE)
const selectedLabel = ref(t('menu.increasingDate'))

// Modal state
const isModalOpen = ref(false)

const options : OptionType[] = [
  { id: FilterOptions.ASC_DATE, name: t('menu.increasingDate') },
  { id: FilterOptions.DESC_DATE, name: t('menu.decreasingDate') },
  { id: FilterOptions.ASC_PLATFORM, name: t('menu.ascendingFormat') },
  { id: FilterOptions.DESC_PLATFORM, name: t('menu.descendingFormat') },
  { id: FilterOptions.ASC_NAME, name: t('menu.ascendingName') },
  { id: FilterOptions.DESC_NAME, name: t('menu.descendingName') },
]

const selectOption = (option: OptionType) => {
  selectedFilter.value = option.id
  selectedLabel.value = option.name
}

const container = ref<HTMLElement | null>(null)

const loadTournaments = async () => {
  if (loading.value || allLoaded.value) return
  loading.value = true

  try {
    const res = await fetch(
      `/api/tournaments?page=${page.value}&limit=20&sort=${selectedFilter.value}`
    )
    const data: Tournament[] = await res.json()

    if (data.length === 0) {
      allLoaded.value = true
    } else {
      tournaments.value.push(...data)
      page.value++
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadTournaments)

useInfiniteScroll(() => window, loadTournaments, {
  distance: 100,
  canLoadMore: () => !loading.value && !allLoaded.value,
})

watch(selectedFilter, () => {
  tournaments.value = []
  page.value = 1
  allLoaded.value = false
  loadTournaments()
})

// Modal methods
const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
}
</script>

<template>
  <Layout>
    <div class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center py-6">{{ t('tournament.tournaments') }}</div>

    <div class="px-4 sm:px-6 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <Menu as="div" class="relative inline-block text-left w-full sm:w-auto">
        <div>
          <MenuButton
            class="inline-flex w-full sm:w-48 justify-between rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C4741]"
          >
            {{ selectedLabel }}
            <ChevronDown />
          </MenuButton>
        </div>

        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems
            class="absolute right-0 mt-2 w-full sm:w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50"
          >
            <div class="px-1 py-1">
              <MenuItem v-for="option in options" :key="option.id" v-slot="{ active }">
                <button
                  @click="selectOption(option)"
                  :class="[
                    active ? 'bg-[#5C4741] text-white' : 'text-gray-900',
                    'group flex w-full items-center rounded-md px-4 py-2 text-sm',
                  ]"
                >
                  {{ option.name }}
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>

      <button
        v-if="user"
        @click="openModal"
        class="font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition bg-[#5C4741] hover:bg-[#7b5f57] text-white cursor-pointer text-sm sm:text-base w-full sm:w-auto"
      >
        {{ t('tournament.newTournament') }}
      </button>
    </div>

    <!-- InfiniteScroll container -->
    <div ref="container" class="h-[calc(100vh-200px)] overflow-y-auto px-4 sm:px-6">
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
        <TournamentCard
          class="my-6 w-full max-w-sm"
          v-for="tournament in tournaments"
          :key="tournament.id"
          :tournament="tournament as Tournament"
          :user="user"
          :games="props.games || []"
          :need-reload="true"
        />
      </div>

      <div v-if="loading" class="text-center py-6 text-gray-500">
        {{ t('infiniteScroll.loading') }}
      </div>
      <div v-if="allLoaded" class="text-center py-6 text-gray-400">
        {{ t('tournament.allTournamentsLoaded') }}
      </div>
    </div>

    <!-- Tournament Modal -->
    <TournamentForm
      v-if="user"
      :isOpen="isModalOpen"
      :mode="TournamentStatus.NEW"
      :games="props.games!"
      :need-reload="true"
      @close="closeModal"
    />
  </Layout>
</template>

<style scoped></style>
