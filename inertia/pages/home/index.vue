<script setup lang="ts">
import { defineProps } from 'vue'
import Layout from '~/components/layouts/layout.vue'
import TournamentCard from '~/components/TournamentCard.vue'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'
import GameCard from '~/components/GameCard.vue'

const props = defineProps({
  title: String,
  description: String,
  tournaments: {
    type: Array as () => Tournament[],
    default: () => []
  },
  games: {
    type: Array as () => Game[],
    default: () => []
  }
})

</script>

<template>
  <Layout>
    <p class="text-4xl font-semibold">Nos Tournois Actuels</p>

    <div v-if="tournaments.length === 0" class="text-center py-8 text-gray-500">
      Aucun tournoi n'est disponible pour le moment.
    </div>

    <div v-else class="py-8">
      <Carousel
        :items-to-show="4"
        :wrap-around="true"
        :breakpoints="{
          1280: { itemsToShow: 4 },
          1024: { itemsToShow: 3 },
          768: { itemsToShow: 2 },
          0: { itemsToShow: 1 }
        }"
        class="tournament-carousel"
      >
        <Slide v-for="tournament in tournaments" :key="tournament.id" class="flex justify-center px-4">
          <TournamentCard :tournament="tournament" />
        </Slide>

        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>

    <p class="text-4xl pt-16 font-semibold">Nos Jeux</p>

    <div class="py-8">
      <Carousel
        :items-to-show="5"
        :wrap-around="true"
        :breakpoints="{
          1280: { itemsToShow: 6 },
          1024: { itemsToShow: 4 },
          768: { itemsToShow: 3 },
          0: { itemsToShow: 2 }
        }"
        class="game-carousel"
      >
        <Slide v-for="game in games" :key="game.id" class="flex justify-center px-4">
          <GameCard :game="game" />
        </Slide>

        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>
  </Layout>
</template>
