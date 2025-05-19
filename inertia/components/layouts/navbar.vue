<script setup lang="ts">
import { ref } from 'vue'
import { Link } from '@inertiajs/vue3'
import blackLogo from '../../img/blackLogo.jpg'

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <!-- navbar -->
  <nav class="flex items-center justify-between px-6 py-4 bg-white shadow-sm h-28">
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
      <img :src="blackLogo" alt="logo de l'application" class="h-14 w-14" />
    </div>

    <!-- Desktop Navigation -->
    <div class="hidden lg:flex flex-1 items-center">
      <!-- Navigation Links -->
      <div class="flex items-center gap-9 font-altone w-1/3 text-xl xl:text-2xl">
        <div class="font-bold">
          <a href="#" class="text-gray-800 hover:text-gray-600">Jeux</a>
        </div>
        <div class="font-bold">
          <a href="#" class="text-gray-800 hover:text-gray-600">Tournois</a>
        </div>
        <div class="font-bold">
          <a href="#" class="text-gray-800 hover:text-gray-600">À propos</a>
        </div>
      </div>

      <!-- Search Bar-->
      <div class="flex justify-center w-1/3">
        <div class="w-full max-w-md">
          <div class="relative">
            <input
              type="text"
              class="w-full py-2 px-4 bg-white border-[#D6B7B0] border rounded-md focus:outline-none focus:ring-2 focus:ring-white h-12"
            />
            <div class="absolute inset-y-0 right-0 flex items-center !pr-3">
              <svg
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
        </div>
      </div>

      <!-- Login Desktop -->
      <div class="flex items-center justify-end w-1/3">
        <Link
          href="/login"
          class="px-9 py-2 text-white bg-[#D6B7B0] text-base font-bold rounded-md"
        >
          Log In
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
        class="lg:hidden absolute top-28 left-0 lg:left-[114px] right-0 bg-white shadow-md z-40 overflow-hidden"
      >
        <div class="flex flex-col p-4 space-y-4 font-altone text-xl">
          <a
            href="#"
            class="text-gray-800 hover:text-gray-600 font-bold py-2 transition-transform duration-300 hover:translate-x-2"
            >Jeux</a
          >
          <a
            href="#"
            class="text-gray-800 hover:text-gray-600 font-bold py-2 transition-transform duration-300 hover:translate-x-2"
            >Tournois</a
          >
          <a
            href="#"
            class="text-gray-800 hover:text-gray-600 font-bold py-2 transition-transform duration-300 hover:translate-x-2"
            >À propos</a
          >

          <div class="py-2">
            <div class="relative">
              <input
                type="text"
                class="w-full py-2 px-4 bg-[#D6B7B0] rounded-md focus:outline-none focus:ring-2 focus:ring-white"
              />
              <div class="absolute inset-y-0 right-0 flex items-center !pr-3">
                <svg
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
                      fill="white"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <!-- Login Mobile -->
          <div class="py-2">
            <Link
              href="/login"
              class="block px-4 py-2 text-center text-white bg-[#D6B7B0] text-base font-bold rounded-md transition-transform duration-300 hover:scale-105"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>
