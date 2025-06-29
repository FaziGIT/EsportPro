<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import User from '#models/user'
import { defineProps, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import Button from '~/components/Button.vue'

const props = defineProps<{
  user: User
}>()

const isPublic = ref(!props.user.isPrivate)
const showConfirm = ref(false)
const pendingValue = ref(isPublic.value)

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

</script>
<template>
  <Layout class="bg-[#fafafa]">
    <p class="text-4xl font-semibold">Mon profil</p>

    <p class="text-2xl pt-12">Mes informations générales</p>
    <div class="bg-[#CBD3CD] rounded-md flex flex-wrap justify-between">
      <div class="p-8">
        <p class="pb-4">Nom : {{ user?.firstName }}</p>
        <p>Prénom : {{ user?.lastName }}</p>
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
            isPublic
              ? 'bg-white translate-x-6'
              : 'bg-[#D6B7B0] translate-x-1'
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

  </Layout>
</template>
