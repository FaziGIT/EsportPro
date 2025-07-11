<script setup lang="ts">
import EditSVG from '~/components/icons/EditSVG.vue'
import Button from '~/components/Button.vue'
import User from '#models/user'
import { defineProps, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import UserInfoField from '~/components/UserInfoField.vue'

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

const originalFirstName = ref(props.user.firstName)
const originalLastName = ref(props.user.lastName)

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

  originalFirstName.value = firstName.value
  originalLastName.value = lastName.value

  editing.value = false
}

const switchEditMode = () => {
  if (editing.value) {
    cancelEdit()
  } else {
    editing.value = true
  }
}

const cancelEdit = () => {
  firstName.value = originalFirstName.value
  lastName.value = originalLastName.value
  editing.value = false
}
</script>

<template>
  <div class="flex justify-between items-center pt-12 pb-4">
    <p class="text-2xl font-semibold mt-8">Mes informations générales</p>
    <button @click="switchEditMode" class="hover:opacity-70 cursor-pointer">
      <EditSVG class="w-6 h-6"/>
    </button>
  </div>


  <div class="bg-[#CBD3CD] rounded-md flex flex-wrap justify-start">
    <div class="p-8 flex flex-col gap-3 w-full md:w-1/3">
      <UserInfoField
        class="pb-2"
        label="Nom"
        :value="firstName"
        :isEditable="editing"
        @update:value="firstName = $event"
      />
      <UserInfoField
        label="Prénom"
        :value="lastName"
        :isEditable="editing"
        @update:value="lastName = $event"
      />
    </div>
    <div class="p-8 flex flex-col gap-3 w-full md:w-1/3">
      <UserInfoField class="pb-2" label="Mon pseudo" :value="user?.pseudo" />
      <UserInfoField label="Mon Email" :value="user?.email" />
    </div>
    <div class="p-8 w-full md:w-1/3">
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

  <div v-if="editing" class="mt-2 flex gap-3">
    <Button @click="updateData" :use-redirection="false" value="Sauvegarder" />
    <Button @click="cancelEdit" :use-redirection="false" color="#D6B7B0" text-color="#000000" value="Annuler" />
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
