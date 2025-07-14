<script setup lang="ts">
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import { defineProps } from 'vue'
import Game from '#models/game'
import TournamentCard from '~/components/TournamentCard.vue'
import Tournament from '#models/tournament'

defineProps({
  title: {
    type: String,
  },
  noElementMessage: {
    type: String,
    required: true
  },
  listTournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
  games: {
    type: Array as () => Game[],
    default: () => [],
  }
})
</script>

<template>
  <p v-if="title" class="text-2xl font-semibold mt-12">{{ title }}</p>
  <div v-if="!listTournaments || listTournaments.length === 0" class="text-center py-8 text-gray-500">
    {{ noElementMessage }}
  </div>
  <div v-else class="py-8">
    <Carousel
      snapAlign="start"
      :items-to-show="4"
      :wrap-around="false"
      :breakpoints="{
        1450: { itemsToShow: 4 },
        1130: { itemsToShow: 3 },
        768: { itemsToShow: 2 },
        0: { itemsToShow: 1 },
      }"
    >
      <Slide
        v-for="tournament in listTournaments"
        :key="tournament.id"
        class="flex justify-center px-4"
      >
        <TournamentCard :tournament="tournament" :games="games" />
      </Slide>

      <!-- Slot pour permettre l'ajout d'éléments personnalisés -->
      <slot name="extra-slide"></slot>

      <template #addons>
        <Navigation />
      </template>
    </Carousel>
  </div>
</template>
