<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import blackLogo from '../../img/blackLogo.jpg'
import { useI18n } from '../../../resources/js/composables/useI18n'
import User from '#models/user'
import Button from '~/components/Button.vue'
import { Profile } from '~/components/icons'

interface SearchResult {
  id: number
  name: string
  type: string
  url: string
  game?: {
    name: string
  }
  pseudo?: string
}

const isMenuOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearchOpen = ref(false)
const isLoading = ref(false)
const selectedIndex = ref(-1)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

watch(isMenuOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

async function performSearch(query: string) {
  if (!query.trim()) {
    searchResults.value = []
    isSearchOpen.value = false
    isLoading.value = false
    selectedIndex.value = -1
    return
  }

  try {
    const response = await fetch(`/search?query=${encodeURIComponent(query)}`)
    const data = await response.json()

    const results: SearchResult[] = []

    if (data.tournaments) {
      data.tournaments.forEach((tournament: SearchResult) => {
        results.push({
          ...tournament,
          type: 'tournament',
          url: `/tournaments/${tournament.id}`,
        })
      })
    }

    if (data.games) {
      data.games.forEach((game: SearchResult) => {
        results.push({
          ...game,
          type: 'game',
          url: `/games/${game.id}`,
        })
      })
    }

    if (data.users) {
      data.users.forEach((user: SearchResult) => {
        results.push({
          ...user,
          type: 'user',
          url: `/profile/${user.pseudo}`,
        })
      })
    }

    searchResults.value = results.slice(0, 10)
    isSearchOpen.value = true
    isLoading.value = false
    selectedIndex.value = -1
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    searchResults.value = []
    isSearchOpen.value = true
    isLoading.value = false
    selectedIndex.value = -1
  }
}

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value

  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    isSearchOpen.value = false
    isLoading.value = false
    selectedIndex.value = -1
    return
  }

  isLoading.value = true

  searchTimeout.value = setTimeout(async () => {
    await performSearch(searchQuery.value)
  }, 1000) as ReturnType<typeof setTimeout>
}

function handleKeyDown(event: KeyboardEvent) {
  if (!isSearchOpen.value) {
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      if (searchResults.value.length > 0) {
        event.preventDefault()
        selectedIndex.value =
          selectedIndex.value < searchResults.value.length - 1 ? selectedIndex.value + 1 : 0
      }
      break
    case 'ArrowUp':
      if (searchResults.value.length > 0) {
        event.preventDefault()
        selectedIndex.value =
          selectedIndex.value > 0 ? selectedIndex.value - 1 : searchResults.value.length - 1
      }
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && selectedIndex.value < searchResults.value.length) {
        selectResult(searchResults.value[selectedIndex.value])
      }
      break
    case 'Escape':
      closeSearchResults()
      break
  }
}

function closeSearchResults() {
  setTimeout(() => {
    isSearchOpen.value = false
    selectedIndex.value = -1
  }, 200)
}

function selectResult(result: SearchResult) {
  router.visit(result.url)
  isSearchOpen.value = false
  searchQuery.value = ''
  selectedIndex.value = -1
}

onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  document.body.style.overflow = ''
})

const page = usePage()
const user = computed(() => page.props.user as User)

const { t } = useI18n()
</script>

<template>
  <!-- navbar -->
  <nav class="flex items-center justify-between px-6 py-4 bg-white shadow-sm h-28 relative">
    <!-- Burger Menu Button (visible on mobile) -->
    <div class="lg:hidden flex items-center justify-between w-full">
      <button @click="toggleMenu" class="focus:outline-none" aria-label="Menu">
        <svg
          class="w-8 h-8 transition-transform duration-300"
          :class="{ 'rotate-90': isMenuOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            v-if="!isMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
      <Link href="/">
        <img :src="blackLogo" alt="logo de l'application" class="h-14 w-14" />
      </Link>
    </div>

    <!-- Desktop Navigation -->
    <div class="hidden lg:flex flex-1 items-center">
      <!-- Navigation Links -->
      <div class="flex items-center gap-9 font-altone w-1/3 text-xl xl:text-2xl">
        <div class="font-bold">
          <Link href="/games" class="text-gray-800 hover:text-gray-600"
            >{{ t('layout.games') }}
          </Link>
        </div>
        <div class="font-bold">
          <Link href="/tournaments" class="text-gray-800 hover:text-gray-600"
            >{{ t('layout.tournaments') }}
          </Link>
        </div>
      </div>

      <!-- Search Bar Desktop -->
      <div class="flex justify-center w-1/3 relative">
        <div class="w-full max-w-md">
          <div class="relative">
            <input
              type="text"
              :value="searchQuery"
              @input="handleSearchInput"
              @keydown="handleKeyDown"
              @focus="searchQuery && performSearch(searchQuery)"
              @blur="closeSearchResults"
              :placeholder="t('layout.search_placeholder')"
              class="w-full py-2 px-4 bg-white border-[#D6B7B0] border-2 shadow-sm rounded-md focus:outline-none focus:ring-2 focus:ring-white h-12"
            />
            <div class="absolute inset-y-0 right-0 flex items-center !pr-3">
              <!-- Loader -->
              <div
                v-if="isLoading"
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D6B7B0]"
              ></div>
              <!-- Search Icon -->
              <svg
                v-else
                width="22"
                height="21"
                viewBox="0 0 22 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_66_2418)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M9.27025 16.0453C5.17296 16.0453 1.8515 12.7575 1.8515 8.69531C1.8515 4.63312 5.17296 1.33878 9.27025 1.33878C13.3675 1.33878 16.6897 4.63312 16.6897 8.69531C16.6897 12.7575 13.3675 16.0453 9.27025 16.0453ZM21.1439 19.8516L15.764 14.5162C17.1724 12.9741 18.0381 10.9397 18.0381 8.69531C18.0381 3.89156 14.1127 0 9.27025 0C4.42776 0 0.502441 3.89156 0.502441 8.69531C0.502441 13.4925 4.42776 17.3841 9.27025 17.3841C11.3625 17.3841 13.2816 16.6556 14.7889 15.4416L20.1903 20.7965C20.4541 21.059 20.8808 21.059 21.1439 20.7965C21.4077 20.5406 21.4077 20.1141 21.1439 19.8516Z"
                    fill="#D6B7B0"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_66_2418">
                    <rect x="0.502441" width="20.8447" height="21" rx="7" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>

          <!-- Search Results Desktop -->
          <div
            v-if="isSearchOpen"
            class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-96 overflow-y-auto z-50"
          >
            <div
              v-for="(result, index) in searchResults"
              :key="`${result.type}-${result.id}`"
              @mousedown="selectResult(result)"
              @mouseenter="selectedIndex = index"
              :class="[
                'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0',
                selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50',
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <span
                    v-if="result.type === 'tournament'"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ t('layout.tournament') }}
                  </span>
                  <span
                    v-else-if="result.type === 'game'"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {{ t('layout.game') }}
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {{ t('layout.user') }}
                  </span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">
                    {{ result.name || result.pseudo }}
                  </p>
                  <p
                    v-if="result.game && result.type === 'tournament'"
                    class="text-xs text-gray-500"
                  >
                    {{ result.game?.name || result.game }}
                  </p>
                </div>
              </div>
            </div>
            <div
              v-if="searchResults.length === 0 && searchQuery && !isLoading"
              class="px-4 py-3 text-sm text-gray-500 text-center italic"
            >
              {{ t('layout.no_results') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Login Desktop -->
      <div v-if="!user" class="flex items-center justify-end w-1/3">
        <Button redirection-path="/login" color="#D6B7B0" :value="t('auth.login')" />
      </div>

      <!-- User Profile -->
      <div v-else class="flex items-center justify-end w-1/3">
        <Link href="/profile" class="flex items-center cursor-pointer px-4">
          <Profile />
          <span class="text-[#5C4741] font-semibold pl-1">{{ user.pseudo }}</span>
        </Link>
        <Link
          href="/logout"
          method="post"
          class="px-9 py-2 text-white bg-[#D6B7B0] text-base font-bold rounded-md cursor-pointer"
        >
          {{ t('auth.logout') }}
        </Link>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[500px]"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-[500px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="isMenuOpen"
        class="lg:hidden absolute top-28 left-0 lg:left-[114px] right-0 bg-white shadow-md z-40 overflow-visible"
      >
        <div class="flex flex-col p-4 space-y-4 text-xl">
          <Link
            href="/games"
            class="text-gray-800 hover:text-gray-600 font-bold py-2 transition-transform duration-300 hover:translate-x-2"
            >{{ t('layout.games') }}
          </Link>
          <Link
            href="/tournaments"
            class="text-gray-800 hover:text-gray-600 font-bold py-2 transition-transform duration-300 hover:translate-x-2"
            >{{ t('layout.tournaments') }}
          </Link>

          <!-- Search Bar Mobile -->
          <div class="py-2 relative">
            <div class="relative">
              <input
                type="text"
                :value="searchQuery"
                @input="handleSearchInput"
                @keydown="handleKeyDown"
                @focus="searchQuery && performSearch(searchQuery)"
                @blur="closeSearchResults"
                :placeholder="t('layout.search_placeholder')"
                class="w-full py-2 px-4 border-[#D6B7B0] border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
              />
              <div class="absolute inset-y-0 right-0 flex items-center !pr-3">
                <!-- Loader -->
                <div
                  v-if="isLoading"
                  class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D6B7B0]"
                ></div>
                <!-- Search Icon -->
                <svg
                  v-else
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_66_2418)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M9.27025 16.0453C5.17296 16.0453 1.8515 12.7575 1.8515 8.69531C1.8515 4.63312 5.17296 1.33878 9.27025 1.33878C13.3675 1.33878 16.6897 4.63312 16.6897 8.69531C16.6897 12.7575 13.3675 16.0453 9.27025 16.0453ZM21.1439 19.8516L15.764 14.5162C17.1724 12.9741 18.0381 10.9397 18.0381 8.69531C18.0381 3.89156 14.1127 0 9.27025 0C4.42776 0 0.502441 3.89156 0.502441 8.69531C0.502441 13.4925 4.42776 17.3841 9.27025 17.3841C11.3625 17.3841 13.2816 16.6556 14.7889 15.4416L20.1903 20.7965C20.4541 21.059 20.8808 21.059 21.1439 20.7965C21.4077 20.5406 21.4077 20.1141 21.1439 19.8516Z"
                      fill="#D6B7B0"
                    />
                  </g>
                </svg>
              </div>
            </div>

            <!-- Search Results Mobile -->
            <div
              v-if="isSearchOpen"
              class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto z-50"
            >
              <div
                v-for="(result, index) in searchResults"
                :key="`mobile-${result.type}-${result.id}`"
                @mousedown="selectResult(result)"
                @mouseenter="selectedIndex = index"
                :class="[
                  'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0',
                  selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50',
                ]"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <span
                      v-if="result.type === 'tournament'"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ t('layout.tournament') }}
                    </span>
                    <span
                      v-else-if="result.type === 'game'"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {{ t('layout.game') }}
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {{ t('layout.user') }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">
                      {{ result.name || result.pseudo }}
                    </p>
                    <p
                      v-if="result.game && result.type === 'tournament'"
                      class="text-xs text-gray-500"
                    >
                      {{ result.game?.name || result.game }}
                    </p>
                  </div>
                </div>
              </div>
              <div
                v-if="searchResults.length === 0 && searchQuery && !isLoading"
                class="px-4 py-3 text-sm text-gray-500 text-center italic"
              >
                {{ t('layout.no_results') }}
              </div>
            </div>
          </div>

          <!-- Login Mobile -->
          <div v-if="!user" class="py-2">
            <Button
              redirection-path="/login"
              color="#D6B7B0"
              :value="t('auth.login')"
              class="block px-4 py-2 text-center text-base font-bold rounded-md transition-transform duration-300"
            />
          </div>
          <!-- User Profile -->
          <div v-else class="py-2">
            <Button
              redirection-path="/profile"
              color="#D6B7B0"
              :value="user.pseudo ?? ''"
              class="block px-4 py-2 text-center text-base font-bold rounded-md transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>
