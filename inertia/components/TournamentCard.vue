<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { defineProps, computed } from 'vue'
import HeartIconSVG from '~/components/icons/HeartIconSVG.vue'
import { DateTime } from 'luxon'

const props = defineProps({
  tournament: {
    type: Object,
    required: true,
  },
})

const imageSource = computed(() => {
  if (!props.tournament.image || props.tournament.image.length === 0) {
    console.log("Image not found for tournament:", props.tournament.name)
    return imageNotFound
  }

  try {
    if (props.tournament.image instanceof Uint8Array || Array.isArray(props.tournament.image)) {
      console.log(props.tournament.image)
      const binary = Array.from(new Uint8Array(props.tournament.image))
        .map((byte) => String.fromCharCode(byte))
        .join('')

      return `data:image/jpeg;base64,${btoa(binary)}`
    }

    return props.tournament.image
  } catch (error) {
    console.error("Erreur lors de la conversion de l'image:", error)
    return imageNotFound
  }
})

const formattedDate = computed(() => {
  if (!props.tournament.startDate) return ''

  if (props.tournament.startDate instanceof DateTime) {
    return props.tournament.startDate.toFormat('dd/MM/yyyy')
  }

  try {
    return DateTime.fromISO(props.tournament.startDate).toFormat('dd/MM/yyyy')
  } catch (error) {
    console.error("Erreur de formatage de date:", error)
    return props.tournament.startDate
  }
})
</script>

<template>
  <div class="rounded-xl shadow-md bg-white overflow-hidden w-full max-w-sm border border-gray-200">
    <div class="bg-gray-100 h-40 flex items-center justify-center">
      <img
        v-if="tournament.image && tournament.image.length > 0"
        :src="imageSource"
        alt="Tournoi Image"
        class="w-full h-full object-cover"
      />
      <div v-else class="flex flex-col items-center justify-center text-gray-500">
        <img :src="imageNotFound" alt="Placeholder" class="w-12 h-12 mb-2" />
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-bold text-black mb-2">
          {{ tournament.name }}
        </h3>
        <HeartIconSVG color="#D6B7B0" />
      </div>
      <p class="text-sm text-gray-600">
        {{ tournament.address }} {{ tournament.city }} {{ tournament.postalCode }}, {{ tournament.country }}
      </p>
      <div class="mt-2 flex flex-row">
        <p class="text-sm text-gray-600 mr-2">
          {{ formattedDate }}
        </p>
        <p class="text-sm text-gray-600">
          {{ tournament.format }}
        </p>
      </div>
    </div>
  </div>
</template>
