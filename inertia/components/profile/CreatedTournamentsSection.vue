<script setup lang="ts">
import TournamentCard from '../TournamentCard.vue'
import Tournament from '#models/tournament'
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'
import { useI18n } from '../../../resources/js/composables/useI18n'

const { t } = useI18n()

defineProps({
  myCreatedTournaments: {
    type: Array as () => Tournament[],
    required: true,
  },
})

const getTournamentStatusColor = (isValidated: boolean) => {
  return isValidated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
}

const getTournamentStatusText = (isValidated: boolean) => {
  return isValidated ? t('tournament.validated') : t('tournament.pendingValidation')
}

</script>

<template>
  <div class="mt-12">
    <p class="text-2xl font-semibold mb-4">{{ t('profile.createdTournaments') }}</p>
    <div class="py-8">
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
          v-for="tournament in myCreatedTournaments"
          :key="tournament.id"
          class="flex justify-center px-4"
        >
          <div class="relative w-full">
            <div
              :class="[
                  'absolute top-2 left-2 z-20 px-2 py-1 rounded-md text-xs font-medium',
                  getTournamentStatusColor(tournament.isValidated),
                ]"
            >
              {{ getTournamentStatusText(tournament.isValidated) }}
            </div>

            <TournamentCard :tournament="tournament" />
          </div>
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>
  </div>
</template>
