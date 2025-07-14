<script setup lang="ts">
import { defineProps } from 'vue'
import Layout from '~/components/layouts/layout.vue'
import TournamentCard from '~/components/TournamentCard.vue'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'
import { useI18n } from '../../../resources/js/composables/useI18n'
import Button from '~/components/Button.vue'
import GamesCarousel from '~/components/game/GamesCarousel.vue'

const { t } = useI18n()

defineProps({
  title: String,
  description: String,
  tournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
  games: {
    type: Array as () => Game[],
    default: () => [],
  },
  allGames: {
    type: Array as () => Game[],
    default: () => [],
  },
})
</script>

<template>
  <Layout class="bg-[#fafafa]">
    <p class="text-4xl font-semibold">{{ t('home.currentTournament') }}</p>

    <div v-if="tournaments.length === 0" class="text-center py-8 text-gray-500">
      {{ t('i18n.unvaliableCurrentlyTournament') }}
    </div>

    <div v-else class="py-8">
      <Carousel
        class="w-full"
        snapAlign="start"
        :wrap-around="false"
        :items-to-show="4"
        :breakpoints="{
          1450: { itemsToShow: 4 },
          1130: { itemsToShow: 3 },
          768: { itemsToShow: 2 },
          0: { itemsToShow: 1 },
        }"
      >
        <Slide
          v-for="tournament in tournaments"
          :key="tournament.id"
          class="flex justify-center px-4"
        >
          <TournamentCard :tournament="tournament" :games="allGames" />
        </Slide>

        <Slide class="flex justify-center items-center px-4">
          <Button
            :value="t('home.showAllTournaments')"
            color="#D6B7B0"
            redirection-path="/tournaments"
          />
        </Slide>

        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>

    <GamesCarousel
      :listGames="games"
      :noElementMessage="t('game.noGames')"
      :title="t('home.ourGames')"
    >
      <template #extra-slide>
        <Slide class="flex justify-center items-center px-4">
          <Button :value="t('home.showAllGames')" color="#D6B7B0" redirection-path="/games" />
        </Slide>
      </template>
    </GamesCarousel>
  </Layout>
</template>
