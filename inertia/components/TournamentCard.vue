<script setup lang="ts">
import imageNotFound from '../img/Image-not-found.png'
import { computed, defineProps, ref } from 'vue'
import HeartIconSVG from '~/components/icons/HeartIconSVG.vue'
import { useI18n } from '../../resources/js/composables/useI18n'
import { usePage, router } from '@inertiajs/vue3'
import User from '#models/user'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'

const { t } = useI18n()

const props = defineProps({
  tournament: {
    type: Object as () => Tournament,
    required: true,
  },
})
const formattedDate = computed(() => {
  if (!props.tournament.startDate) return 'Date non spécifiée'

  try {
    if (props.tournament.startDate instanceof DateTime) {
      return props.tournament.startDate.toFormat('dd/MM/yyyy')
    }

    if (typeof props.tournament.startDate === 'string') {
      return DateTime.fromISO(props.tournament.startDate).toFormat('dd/MM/yyyy')
    }

const imageSource = computed(() => {
  if (props.tournament?.id) {
    return `/tournaments/${props.tournament.id}/image`
  }

  return imageNotFound
})

const isHovered = ref(false)
const heartIconColor = computed(() => (isHovered.value ? '#5C4741' : '#D6B7B0'))

const page = usePage()
const user = computed(() => page.props.user as User)

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = <string>imageNotFound
  }
}

const navigateToTournament = () => {
  if (!props.tournament?.id) {
    console.error('Tournament ID is missing:', props.tournament)
    return
  }
  
  router.visit(`/tournaments/${props.tournament.id}`)
}

</script>

<template>
  <div 
    class="flex flex-col justify-between w-96 h-96 min-w-80 rounded-xl shadow-md bg-white overflow-hidden border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
    @click="navigateToTournament"
    @mouseenter="isHovered = true" 
    @mouseleave="isHovered = false"
  >
    <div class="bg-gray-100 h-48 flex items-center justify-center">
      <div class="flex flex-col items-center justify-center text-gray-500">
        <img :src="imageNotFound" alt="Placeholder" class="w-12 h-12 mb-2" />
      </div>
    </div>

    <div class="p-4 flex flex-col justify-between flex-grow">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-bold text-black truncate max-w-[calc(100%-28px)]">
          {{ tournament.name || t('tournament.tournamentNameUndefined') }}
        </h3>
        <HeartIconSVG
          v-if="user"
          :color="heartIconColor"
          class="flex-shrink-0 cursor-pointer"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        />
      </div>

      <p class="text-sm text-gray-600 line-clamp-2">
        {{ tournament.address || '' }} {{ tournament.city || '' }} {{ tournament.postalCode || ''
        }}{{ tournament.country ? ', ' + tournament.country : '' }}
      </p>

      <div class="mt-auto flex flex-row justify-between">
        <div>
          <p class="text-sm text-gray-600">
            {{
              tournament.numberPlayersPerTeam
                ? t('tournament.teamsOf') + ' ' + tournament.numberPlayersPerTeam
                : t('tournament.stillUnknown')
            }}
          </p>
          <p class="text-sm text-gray-600">
            {{ DateTime.fromISO(tournament.startDate.toString()).toFormat('dd/MM/yyyy HH:mm') }}
          </p>
        </div>
        <div class="">
          <p
            class="text-sm text-[#5C4741] font-semibold bg-[#CBD3CD] border-[#CBD3CD] border-2 rounded-md px-2 py-1 w-fit"
          >
            {{ tournament.format || t('tournament.undefinedFormat') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
