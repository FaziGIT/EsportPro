<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import GeneralInfoUser from '~/components/profile/GeneralInfoUser.vue'
import { defineProps } from 'vue'
import User from '#models/user'
import TournamentCard from '~/components/TournamentCard.vue'
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'
import Tournament from '#models/tournament'

defineProps({
  user: {
    type: Object as () => User,
    required: true,
  },
  tournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
})
</script>
<template>
  <Layout class="bg-[#fafafa]">
    <p class="text-4xl font-semibold">Mon profil</p>
    <GeneralInfoUser :user="user" />

    <p class="text-2xl font-semibold mt-12">Mes tournois</p>
    <div v-if="!tournaments || tournaments.length === 0" class="text-center py-8 text-gray-500">
      Aucun tournoi en cours.
    </div>
    <div v-else class="py-8">
      <Carousel
        :items-to-show="4"
        :wrap-around="false"
        :breakpoints="{
          1280: { itemsToShow: 4 },
          1024: { itemsToShow: 3 },
          768: { itemsToShow: 2 },
          0: { itemsToShow: 1 },
        }"
        class="tournament-carousel"
      >
        <Slide
          v-for="tournament in tournaments"
          :key="tournament.id"
          class="flex justify-center px-4"
        >
          <TournamentCard :tournament="tournament" />
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>
  </Layout>
</template>
