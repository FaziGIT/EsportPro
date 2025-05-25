<script setup lang="ts">
import Tournament from '#models/tournament'
import imageNotFound from '../img/Image-not-found.png'
import { defineProps } from 'vue'

const props = defineProps({
  tournament: {
    type: Tournament,
    required: true,
  },
})
</script>

<template>
  <div class="rounded-xl shadow-md bg-white overflow-hidden w-full max-w-sm border border-gray-200">
    <div class="bg-gray-100 h-40 flex items-center justify-center">
      <img
        v-if="tournament.image && tournament.image.length > 0"
        :src="tournament.image"
        alt="Tournoi"
        class="w-full h-full object-cover"
      />
      <div v-else class="flex flex-col items-center justify-center text-gray-500">
        <img :src="imageNotFound" alt="Placeholder" class="w-12 h-12 mb-2" />
      </div>
    </div>

    <div class="p-4">
      <h3 class="text-lg font-bold text-black mb-2">
        {{ tournament.name }}
      </h3>
      <p class="text-sm text-gray-600">
        {{ tournament.rules || 'Demandez à l\'organisateur pour les règles' }}
      </p>
    </div>
  </div>
</template>
