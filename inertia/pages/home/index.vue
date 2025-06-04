<script setup lang="ts">
import { defineProps } from 'vue'
import Layout from '~/components/layouts/layout.vue'
import TournamentCard from '~/components/TournamentCard.vue'
import Tournament from '#models/tournament'
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const props = defineProps({
  title: String,
  description: String,
  tournaments: {
    type: Array as () => Tournament[],
    default: () => []
  }
})

</script>

<template>
  <Layout>
    <p>{{ props.title }}</p>
    <p>{{ props.description }}</p>

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
  </Layout>
</template>
