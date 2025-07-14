<script setup lang="ts">
import GameCard from '~/components/GameCard.vue'
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import { defineProps } from 'vue'
import Game from '#models/game'

defineProps({
  title: {
    type: String,
  },
  noElementMessage: {
    type: String,
    required: true
  },
  listGames: {
    type: Array as () => Game[],
    default: () => [],
  },
  showButton: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <p v-if="title" class="text-2xl font-semibold mt-12">{{ title }}</p>
  <div v-if="!listGames || listGames.length === 0" class="text-center py-8 text-gray-500">
    {{ noElementMessage }}
  </div>
  <div v-else class="py-8">
    <Carousel
      snapAlign="start"
      :items-to-show="6"
      :wrap-around="false"
      :breakpoints="{
          1280: { itemsToShow: 6 },
          1024: { itemsToShow: 4 },
          768: { itemsToShow: 3 },
          0: { itemsToShow: 2 },
        }"
    >
      <Slide
        v-for="game in listGames"
        :key="game.id"
        class="flex justify-center px-4"
      >
        <GameCard :game="game" />
      </Slide>

      <!-- Slot pour permettre l'ajout d'éléments personnalisés -->
      <slot name="extra-slide"></slot>

      <template #addons>
        <Navigation />
      </template>
    </Carousel>
  </div>
</template>
