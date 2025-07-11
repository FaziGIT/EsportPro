<script setup lang="ts">
import EditSVG from '~/components/icons/EditSVG.vue'
import Button from '~/components/Button.vue'
import User from '#models/user'
import { defineProps, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import { useI18n } from '../../../resources/js/composables/useI18n'


// const { t } = useI18n()

const props = defineProps({
  user: {
    type: Object as () => User,
    required: true,
  },
})

const isPublic = ref(!props.user.isPrivate)
const showConfirm = ref(false)
const pendingValue = ref(isPublic.value)

const editing = ref(false)
const firstName = ref(props.user.firstName)
const lastName = ref(props.user.lastName)


const onSwitchClick = () => {
  pendingValue.value = !isPublic.value
  showConfirm.value = true
}

const confirmChange = () => {
  isPublic.value = pendingValue.value
  showConfirm.value = false

  router.post('/profile/privacy', {
    isPrivate: !isPublic.value,
  }, {
    preserveScroll: true
  })
}

const cancelChange = () => {
  showConfirm.value = false
}

const updateData = () => {
  router.post('/profile/update-data', {
    firstName: firstName.value,
    lastName: lastName.value
  }, {
    preserveScroll: true
  })
  editing.value = false
}
</script>

<template>
  <div class="flex justify-between items-center">
    <p class="text-2xl pt-12 pb-4">Mes informations générales</p>
    <button @click="editing = !editing" class="hover:opacity-70 cursor-pointer">
      <EditSVG class="w-6 h-6"/>
    </button>
  </div>

  <div class="bg-[#CBD3CD] rounded-md flex flex-wrap justify-between">
    <div class="p-8 flex flex-col gap-4">
      <div>
        <label class="block mb-1">Nom :</label>
        <template v-if="editing">
          <input
            v-model="firstName"
            class="border rounded p-2 w-64"
            type="text"
          />
        </template>
        <template v-else>
          <div class="border border-[#5C4741] rounded p-2 bg-[#fafafa]" style="min-width: 8rem; min-height: 1.75rem;">{{ firstName }}</div>
        </template>
      </div>
      <div>
        <label class="block mb-1">Prénom :</label>
        <template v-if="editing">
          <input
            v-model="lastName"
            class="border rounded p-2 w-64"
            type="text"
          />
        </template>
        <template v-else>
          <div class="border border-[#5C4741] rounded p-2 bg-[#fafafa] h-6" style="min-width: 8rem;">{{ lastName }}</div>
        </template>
      </div>

      <div v-if="editing" class="mt-2">
        <Button @click="updateData" :use-redirection="false" value="Sauvegarder" />
      </div>
    </div>
    <div class="p-8">
      <p class="pb-4">Mon pseudo : {{ user?.pseudo }}</p>
      <p>Mon Email : {{ user?.email }}</p>
    </div>
    <div class="p-8">
      <div class="flex flex-wrap">
        <p class="pr-4">Mon compte est public ? </p>
        <button
          :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer border',
              isPublic ? 'bg-[#D6B7B0] border-[#D6B7B0]' : 'bg-white border-[#D6B7B0]'
            ]"
          @click="onSwitchClick"
        >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full transition-transform cursor-pointer',
                isPublic ? 'bg-white translate-x-6' : 'bg-[#D6B7B0] translate-x-1'
              ]"
            />
        </button>
      </div>
    </div>
  </div>

  <!-- Popup de confirmation -->
  <div v-if="showConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
      <p class="text-lg font-semibold mb-4">
        Confirmer le changement
      </p>
      <p class="mb-6">
        Voulez-vous vraiment {{ pendingValue ? 'rendre votre compte public' : 'passer votre compte en privé' }} ?
      </p>
      <div class="flex justify-end gap-2">
        <Button @click="cancelChange" :use-redirection="false" color="#CBD3CD" text-color="#000000" value="Annuler"/>
        <Button @click="confirmChange" :use-redirection="false" value="Confirmer"/>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
