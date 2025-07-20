<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
import logo from '../../img/logo.png'
import imageNotFound from '../../img/Image-not-found.png'
import { PlusIcon } from '../icons'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { useAuth } from '../../../resources/js/composables/useAuth'
import { useUserData } from '../../../resources/js/composables/usePageProps'

const { t } = useI18n()
const { isAuthenticated } = useAuth()
const { userTournaments, userGames } = useUserData()

const isDropdownOpen = ref(false)
const isTournamentsDropdownOpen = ref(false)
const maxDisplayedItems = 4

const displayedTournaments = computed(() => userTournaments.value.slice(0, maxDisplayedItems))
const hiddenTournaments = computed(() => userTournaments.value.slice(maxDisplayedItems))

const displayedGames = computed(() => userGames.value.slice(0, maxDisplayedItems))
const hiddenGames = computed(() => userGames.value.slice(maxDisplayedItems))

const getImageUrl = (type: 'game' | 'tournament', id: string) => {
  return `/${type}s/${id}/image`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const toggleTournamentsDropdown = () => {
  isTournamentsDropdownOpen.value = !isTournamentsDropdownOpen.value
}

</script>

<template>
  <div
    class="bg-[#779E7E] lg:w-[114px] h-full fixed left-0 top-0 flex-col items-center pt-3 shadow-md z-50 hidden lg:flex"
    @click="
      isDropdownOpen = false;
      isTournamentsDropdownOpen = false
    "
  >
    <div class="mb-6" @click.stop>
      <Link href="/">
        <img :src="logo" alt="Logo" class="w-20 h-20" />
      </Link>
    </div>

    <template v-if="isAuthenticated && userTournaments.length > 0">
      <div class="relative mb-3">
        <div
          class="text-center text-white text-xs font-bold tracking-wider uppercase mb-1 drop-shadow-sm"
        >
          {{ t('layout.tournaments') }}
        </div>
        <div
          class="w-12 h-0.5 bg-gradient-to-r from-white to-gray-200 mx-auto rounded-full shadow-sm"
        ></div>
      </div>

      <div class="flex flex-col items-center space-y-3 relative mb-5">
        <Link
          v-for="tournament in displayedTournaments"
          :key="tournament.id"
          :href="`/tournaments/${tournament.id}`"
          class="w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-white hover:ring-opacity-70 transition-all duration-200 border-2 border-white border-opacity-30"
          :title="tournament.name"
        >
          <img
            :src="getImageUrl('tournament', tournament.id)"
            :alt="tournament.name"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </Link>

        <div
          v-if="hiddenTournaments.length > 0"
          @click.stop="toggleTournamentsDropdown"
          class="w-12 h-12 rounded-lg bg-opacity-20 flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-all duration-200 border-2 border-white border-opacity-30 mb-0"
        >
          <div
            class="transform transition-transform duration-300 ease-in-out"
            :class="{ 'rotate-180': isTournamentsDropdownOpen }"
          >
            <PlusIcon :size="20" color="white" />
          </div>
        </div>

        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isTournamentsDropdownOpen && hiddenTournaments.length > 0"
            class="absolute top-[77.5%] left-16 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-[60]"
            @click.stop
          >
            <Link
              v-for="tournament in hiddenTournaments"
              :key="tournament.id"
              :href="`/tournaments/${tournament.id}`"
              class="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
            >
              <div
                class="w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-white border-opacity-30"
              >
                <img
                  :src="getImageUrl('tournament', tournament.id)"
                  :alt="tournament.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <span class="text-gray-800 font-medium">{{ tournament.name }}</span>
            </Link>
          </div>
        </Transition>
      </div>
      <div v-if="userGames.length > 0" class="w-16 h-px bg-white bg-opacity-30 mb-5"></div>
    </template>

    <template v-if="isAuthenticated && userGames.length > 0">
      <div class="relative mb-3">
        <div
          class="text-center text-white text-xs font-bold tracking-wider uppercase mb-1 drop-shadow-sm"
        >
          {{ t('layout.games') }}
        </div>
        <div
          class="w-12 h-0.5 bg-gradient-to-r from-black to-yellow-900 mx-auto rounded-full shadow-sm"
        ></div>
      </div>

      <div class="flex flex-col items-center space-y-3 relative">
        <Link
          v-for="game in displayedGames"
          :key="game.id"
          :href="`/games/${game.id}`"
          class="w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#5C4741] hover:ring-opacity-70 transition-all duration-200 border-2 border-[#5C4741] border-opacity-30"
          :title="game.name"
        >
          <img
            :src="getImageUrl('game', game.id)"
            :alt="game.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
        </Link>

        <div
          v-if="hiddenGames.length > 0"
          @click.stop="toggleDropdown"
          class="w-12 h-12 rounded-lg bg-brown-600 bg-opacity-20 flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-all duration-200 border-2 border-[#5C4741] border-opacity-30"
        >
          <div
            class="transform transition-transform duration-300 ease-in-out"
            :class="{ 'rotate-180': isDropdownOpen }"
          >
            <PlusIcon :size="20" color="#5C4741" />
          </div>
        </div>

        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isDropdownOpen && hiddenGames.length > 0"
            class="absolute top-[77.5%] left-16 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-[60]"
            @click.stop
          >
            <Link
              v-for="game in hiddenGames"
              :key="game.id"
              :href="`/games/${game.id}`"
              class="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
            >
              <div
                class="w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-brown-600 border-opacity-30"
              >
                <img
                  :src="getImageUrl('game', game.id)"
                  :alt="game.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <span class="text-gray-800 font-medium">{{ game.name }}</span>
            </Link>
          </div>
        </Transition>
      </div>
    </template>
  </div>

  <div
    v-if="isDropdownOpen || isTournamentsDropdownOpen"
    @click="
      isDropdownOpen = false;
      isTournamentsDropdownOpen = false
    "
    class="fixed inset-0 z-[40]"
  ></div>
</template>
