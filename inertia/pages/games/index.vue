<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import { onMounted, ref, watch } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useInfiniteScroll } from '@vueuse/core'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { useAuth } from '../../../resources/js/composables/useAuth'
import { ChevronDown } from '~/components/icons'
import Game from '#models/game'
import GameCard from '~/components/GameCard.vue'
import GameForm from '~/components/GameForm.vue'
import { GameStatus } from '#types/game'

const { t } = useI18n()
const { user } = useAuth()

const games = ref<Game[]>([])
const page = ref(1)
const loading = ref(false)
const allLoaded = ref(false)

const selectedFilter = ref('closest')
const selectedLabel = ref(t('menu.ascendingName'))

// Modal state
const isModalOpen = ref(false)

const options = [
  { id: 'closest', name: t('menu.ascendingName') },
  { id: 'furthest', name: t('menu.descendingName') },
  { id: 'plateform', name: t('menu.platform') },
]

const selectOption = (option: { id: string; name: string }) => {
  selectedFilter.value = option.id
  selectedLabel.value = option.name
}

const container = ref<HTMLElement | null>(null)

const loadGames = async () => {
  if (loading.value || allLoaded.value) return
  loading.value = true

  try {
    const res = await fetch(`/api/games?page=${page.value}&limit=20&sort=${selectedFilter.value}`)
    const data: Game[] = await res.json()

    if (data.length === 0) {
      allLoaded.value = true
    } else {
      games.value.push(...data)
      page.value++
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadGames)

useInfiniteScroll(() => window, loadGames, {
  distance: 100,
  canLoadMore: () => !loading.value && !allLoaded.value,
})

watch(selectedFilter, () => {
  games.value = []
  page.value = 1
  allLoaded.value = false
  loadGames()
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
    <div class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center py-6">{{ t('game.ourGames') }}</div>

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
        {{ t('game.newGame') }}
      </button>
    </div>

    <!-- InfiniteScroll container -->
    <div ref="container" class="h-[calc(100vh-200px)] overflow-y-auto px-4 sm:px-6">
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center">
        <GameCard class="my-6 w-full max-w-xs" v-for="game in games as Game[]" :key="game.id" :game="game" />
      </div>

      <div v-if="loading" class="text-center py-6 text-gray-500">
        {{ t('infiniteScroll.loading') }}
      </div>
      <div v-if="allLoaded" class="text-center py-6 text-gray-400">
        {{ t('game.allGamesLoaded') }}
      </div>
    </div>
    
    <!-- Game Modal -->
    <GameForm v-if="user" :isOpen="isModalOpen" :mode="GameStatus.NEW" @close="closeModal" />
  </Layout>
</template>

<style scoped></style>
