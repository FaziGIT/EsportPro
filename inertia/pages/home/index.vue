<script setup lang="ts">
import { defineProps } from 'vue'
import Layout from '~/components/layouts/layout.vue'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { useI18n } from '../../../resources/js/composables/useI18n'
import Button from '~/components/Button.vue'
import GamesCarousel from '~/components/game/GamesCarousel.vue'
import TournamentsCarousel from '~/components/tournament/TournamentsCarousel.vue'
import 'vue3-carousel/dist/carousel.css'
import { Slide } from 'vue3-carousel'
import AppHead from '~/components/layouts/AppHead.vue'

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
  <AppHead
    :title="t('home.home')"
    :description="t('home.welcomeMessage')" />

  <Layout class="bg-[#fafafa]">
    <TournamentsCarousel
      :list-tournaments="tournaments"
      :games="allGames"
      :no-element-message="t('home.unvaliableCurrentlyTournament')"
      :title="t('home.currentTournament')"
    >
      <template #extra-slide>
        <Slide class="flex justify-center items-center px-4">
          <Button
            :value="t('home.showAllTournaments')"
            color="#D6B7B0"
            redirection-path="/tournaments"
          />
        </Slide>
      </template>
    </TournamentsCarousel>

    <GamesCarousel
      :list-games="games"
      :no-element-message="t('game.noGames')"
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
