<script setup lang="ts">
import { defineProps, computed } from 'vue'
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

// Fonction pour découper les tournois en groupes de 3
const chunkedTournaments = computed(() => {
  const chunks = []
  for (let i = 0; i < props.tournaments.length; i += 3) {
    chunks.push(props.tournaments.slice(i, i + 3))
  }
  return chunks
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
        :items-to-show="1"
        :wrap-around="true"
        :breakpoints="{
          1024: { itemsToShow: 1 },
          768: { itemsToShow: 1 },
          480: { itemsToShow: 1 }
        }"
        class="tournament-carousel"
      >
        <Slide v-for="(group, index) in chunkedTournaments" :key="index">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <TournamentCard
              v-for="tournament in group"
              :key="tournament.id"
              :tournament="tournament"
            />
          </div>
        </Slide>

        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>
  </Layout>
</template>
