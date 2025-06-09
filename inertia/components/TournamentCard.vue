<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { defineProps, computed, ref } from 'vue'
import HeartIconSVG from '~/components/icons/HeartIconSVG.vue'
import { DateTime } from 'luxon'
import { useI18n } from '../../resources/js/composables/useI18n'
import { usePage } from '@inertiajs/vue3'
import User from '#models/user'

const { t } = useI18n()

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

const page = usePage()
const user = computed(() => page.props.user as User)

</script>

<template>
  <div class="flex flex-col justify-between w-96 h-96 min-w-80 rounded-xl shadow-md bg-white overflow-hidden border border-gray-200">
    <div class="bg-gray-100 h-48 flex items-center justify-center">
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

    <div class="p-4 flex flex-col justify-between flex-grow">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-bold text-black truncate max-w-[calc(100%-28px)]">
          {{ tournament.name || t('i18n.tournamentNameUndefined') }}
        </h3>
        <HeartIconSVG v-if="user" :color="heartIconColor" class="flex-shrink-0 cursor-pointer" @mouseenter="isHovered = true" @mouseleave="isHovered = false"/>
      </div>

      <p class="text-sm text-gray-600 line-clamp-2">
        {{ tournament.address || '' }} {{ tournament.city || '' }} {{ tournament.postalCode || '' }}{{ tournament.country ? ', ' + tournament.country : '' }}
      </p>

      <div class="mt-auto flex flex-row justify-between">
        <div>
          <p class="text-sm text-gray-600">
            Equipe de {{ tournament.numberPlayersPerTeam || t('i18n.stillUnknown') }}
          </p>
          <p class="text-sm text-gray-600">
            {{ formattedDate }}
          </p>
        </div>
        <div class="">
          <p class="text-sm text-[#5C4741] font-semibold bg-[#CBD3CD] border-[#CBD3CD] border-2 rounded-md px-2 py-1 w-fit">
            {{ tournament.format || t('i18n.undefinedFormat') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
