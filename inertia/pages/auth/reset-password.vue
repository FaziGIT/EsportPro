<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import background from '~/img/auth/bg.png'
import { Head, Link, router, useForm } from '@inertiajs/vue3'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { onMounted, ref } from 'vue'

interface Props {
  token: string
  email?: string
  error?: string | object
  success?: boolean
}

const props = defineProps<Props>()

const form = useForm({
  password: '',
  password_confirmation: '',
})

const { t } = useI18n()
const isValidToken = ref(true)
const currentSeconds = ref(3)

onMounted(async () => {
  if (props.error) {
    isValidToken.value = false
  }
})

const submit = () => {
  form.post(`/reset-password/${props.token}`, {
    onSuccess: () => {
      // Start the countdown
      const interval = setInterval(() => {
        currentSeconds.value--
        if (currentSeconds.value <= 0) {
          clearInterval(interval)
          router.visit('/login')
        }
      }, 1000)
    },
  })
}
</script>

<template>
  <Head :title="t('auth.resetPassword')" />

  <Layout>
    <div class="flex mt-16 flex-col items-center">
      <h1 class="md:text-6xl text-4xl font-altone">{{ t('auth.resetPassword') }}</h1>

      <!-- Success message -->
      <div
        v-if="props.success"
        class="w-full max-w-[calc(100%-2rem)] md:w-[700px] mx-auto px-4 md:px-0 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"
      >
        <div class="text-sm font-medium flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18px"
            height="18px"
            fill="currentColor"
            class="mr-2 mt-[1px] flex-shrink-0"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.23 10.661a.75.75 0 00-1.06 1.06l2.21 2.21a.75.75 0 001.137-.089l3.857-5.391z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <span>{{ t('auth.resetSuccess') }}</span>
            <br />
            <span class="text-xs">{{
              t('auth.redirectingToLogin', { seconds: currentSeconds })
            }}</span>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div
        v-if="!isValidToken || (props.error && !props.success)"
        class="w-full max-w-[calc(100%-2rem)] md:w-[700px] mx-auto px-4 md:px-0 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"
      >
        <p class="text-sm font-medium flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18px"
            height="18px"
            fill="currentColor"
            class="mr-2 mt-[1px] flex-shrink-0"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm-1 6a1 1 0 100 2 1 1 0 000-2z"
              clip-rule="evenodd"
            />
          </svg>
          <span v-if="props.error && typeof props.error === 'string'">{{ props.error }}</span>
          <span v-else-if="props.error">{{ t('auth.error') }}</span>
          <span v-else>{{ t('auth.invalidToken') }}</span>
        </p>
      </div>

      <!-- Form -->
      <form
        v-if="isValidToken && !props.error && !props.success"
        @submit.prevent="submit"
        class="w-full px-4 md:px-0 md:w-[700px]"
      >
        <div class="flex flex-col md:flex-row border-[#779E7E] border rounded-xl mt-6 md:h-[500px]">
          <div class="w-full md:w-1/2 hidden md:block">
            <img
              :src="background"
              class="h-full w-full object-cover rounded-l-xl"
              alt="image background reset password page"
            />
          </div>
          <div class="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-10">
            <!-- Confirmation email -->
            <div v-if="props.email" class="w-full mb-4">
              <p class="text-[#5C4741] text-sm md:text-base font-altone text-center">
                {{ t('auth.resetPasswordFor') }} <strong>{{ props.email }}</strong>
              </p>
            </div>

            <!-- New password -->
            <div class="flex flex-col items-start gap-1 w-full">
              <label class="font-altone text-sm md:text-base font-normal" for="password">
                {{ t('auth.newPassword') }}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                v-model="form.password"
                required
                class="rounded-sm p-2 w-full border border-[#5C4741] h-7"
                :class="{
                  'border-red-500': form.errors.password,
                }"
                :disabled="form.processing"
                :placeholder="t('auth.passwordRequirementsPlaceholder')"
              />
              <div v-if="form.errors.password" class="w-full">
                <p class="text-xs text-red-500 font-medium flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13px"
                    height="13px"
                    fill="currentColor"
                    class="mr-1.5 mt-[1.5px] flex-shrink-0"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm-1 6a1 1 0 100 2 1 1 0 000-2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ form.errors.password }}</span>
                </p>
              </div>
            </div>

            <!-- Confirm password -->
            <div class="flex flex-col items-start mt-4 gap-1 w-full">
              <label
                class="font-altone text-sm md:text-base font-normal"
                for="password_confirmation"
              >
                {{ t('auth.confirmPassword') }}
              </label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                v-model="form.password_confirmation"
                required
                class="rounded-sm p-2 w-full border border-[#5C4741] h-7"
                :class="{
                  'border-red-500': form.errors.password_confirmation,
                }"
                :disabled="form.processing"
                :placeholder="t('auth.confirmPasswordPlaceholder')"
              />
              <div v-if="form.errors.password_confirmation" class="w-full">
                <p class="text-xs text-red-500 font-medium flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13px"
                    height="13px"
                    fill="currentColor"
                    class="mr-1.5 mt-[1.5px] flex-shrink-0"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm-1 6a1 1 0 100 2 1 1 0 000-2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ form.errors.password_confirmation }}</span>
                </p>
              </div>
            </div>

            <!-- Security indication -->
            <div class="w-full mt-4">
              <p class="text-xs text-[#5C4741]">
                {{ t('auth.passwordRequirements') }}
              </p>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4 md:gap-7 mt-8 md:mt-12 w-full flex-col md:flex-row">
              <Link
                href="/login"
                class="bg-[#D6B7B0] px-4 py-2 rounded-lg font-altone text-sm md:text-base text-black flex-1 cursor-pointer text-center flex items-center justify-center hover:bg-[#C6A7A0]"
              >
                {{ t('auth.backToLogin') }}
              </Link>
              <button
                type="submit"
                :disabled="form.processing"
                class="bg-[#5C4741] text-white px-4 py-2 rounded-lg font-altone text-sm md:text-base flex-1 cursor-pointer disabled:opacity-50 flex items-center justify-center hover:bg-[#4C3D38]"
              >
                <span v-if="form.processing">{{ t('common.loading') }}...</span>
                <span v-else>{{ t('auth.resetPassword') }}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      <!-- Back link if token is invalid -->
      <div v-if="!isValidToken || (props.error && !props.success)" class="mt-8">
        <Link
          href="/forgot-password"
          class="bg-[#5C4741] text-white px-6 py-3 rounded-lg font-altone text-sm md:text-base cursor-pointer hover:bg-[#4C3D38]"
        >
          {{ t('auth.requestNewLink') }}
        </Link>
      </div>
    </div>
  </Layout>
</template>
