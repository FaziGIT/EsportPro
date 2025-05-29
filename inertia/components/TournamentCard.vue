<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { defineProps, computed, ref } from 'vue'
import HeartIconSVG from '~/components/icons/HeartIconSVG.vue'
import { DateTime } from 'luxon'

const props = defineProps({
  tournament: {
    type: Object,
    required: true,
  },
})

// const imageSource = computed(() => {
//   if (!props.tournament.image || !props.tournament.image.length) {
//     return imageNotFound
//   }
//
//   try {
//     if (props.tournament.image instanceof Uint8Array ||
//       (Array.isArray(props.tournament.image) && props.tournament.image.every(item => typeof item === 'number'))) {
//
//       const binary = Array.from(new Uint8Array(props.tournament.image))
//         .map((byte) => String.fromCharCode(byte))
//         .join('')
//
//       if (!binary) return imageNotFound
//       return `data:image/jpeg;base64,${btoa(binary)}`
//     }
//
//     if (typeof props.tournament.image === 'string') {
//       return props.tournament.image
//     }
//
//     return imageNotFound
//   } catch (error) {
//     console.error("Erreur lors de la conversion de l'image:", error)
//     return imageNotFound
//   }
// })

const formattedDate = computed(() => {
  if (!props.tournament.startDate) return 'Date non spécifiée'

  try {
    if (props.tournament.startDate instanceof DateTime) {
      return props.tournament.startDate.toFormat('dd/MM/yyyy')
    }

    if (typeof props.tournament.startDate === 'string') {
      return DateTime.fromISO(props.tournament.startDate).toFormat('dd/MM/yyyy')
    }

    if (props.tournament.startDate instanceof Date) {
      return DateTime.fromJSDate(props.tournament.startDate).toFormat('dd/MM/yyyy')
    }

    return String(props.tournament.startDate)
  } catch (error) {
    console.error("Erreur de formatage de date:", error)
    return 'Date non spécifiée'
  }
})

const isHovered = ref(false)
const heartIconColor = computed(() => (isHovered.value ? '#5C4741' : '#D6B7B0'))
</script>

<template>
  <div class="rounded-xl shadow-md bg-white overflow-hidden w-full max-w-sm border border-gray-200">
    <div class="bg-gray-100 h-40 flex items-center justify-center">
<!--      <img-->
<!--        v-if="tournament.image && tournament.image.length > 0"-->
<!--        :src="tournament.image"-->
<!--        alt="Tournoi Image"-->
<!--        class="w-full h-full object-cover"-->
<!--      />-->
      <div class="flex flex-col items-center justify-center text-gray-500">
        <img :src="imageNotFound" alt="Placeholder" class="w-12 h-12 mb-2" />
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-bold text-black mb-2 truncate max-w-[calc(100%-28px)]">
          {{ tournament.name || 'Tournoi sans nom' }}
        </h3>
        <HeartIconSVG :color="heartIconColor" class="flex-shrink-0 cursor-pointer" @mouseenter="isHovered = true" @mouseleave="isHovered = false"/>
      </div>
      <p class="text-sm text-gray-600">
        {{ tournament.address || '' }} {{ tournament.city || '' }} {{ tournament.postalCode || '' }}
        {{ tournament.country ? (', ' + tournament.country) : '' }}
      </p>
      <div class="mt-2 flex flex-col">
        <p class="text-sm text-gray-600">
          {{ tournament.format || 'Format non défini' }}
        </p>
        <p class="text-sm text-gray-600">
          Equipe de {{ tournament.numberPlayersPerTeam || 'encore inconnu' }}
        </p>
      </div>
      <p class="text-sm text-gray-600 mr-2">
        {{ formattedDate }}
      </p>
    </div>
  </div>
</template>
