<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import background from '~/img/auth/bg.png'
import { Head, Link, useForm } from '@inertiajs/vue3'
import { useI18n } from '../../../resources/js/composables/useI18n'

interface Props {
  success?: boolean
  error?: string | object
}

const props = defineProps<Props>()

const form = useForm({
  email: '',
})

const { t } = useI18n()

const submit = () => {
  form.post('/forgot-password')
}
</script>

<template>
  <Head :title="t('auth.resetPasswordTitle')" />

  <Layout>
    <div class="flex mt-16 flex-col items-center">
      <h1 class="md:text-6xl text-4xl font-altone">{{ t('auth.resetPasswordTitle') }}</h1>

      <!-- Success message -->
      <div
        v-if="props.success"
        class="w-full max-w-[calc(100%-2rem)] md:w-[700px] mx-auto px-4 md:px-0 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"
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
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.23 10.661a.75.75 0 00-1.06 1.06l2.21 2.21a.75.75 0 001.137-.089l3.857-5.391z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ t('auth.resetLinkSent') }}</span>
        </p>
      </div>

      <!-- Error message -->
      <div
        v-if="props.error"
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
          <span v-if="typeof props.error === 'string'">{{ props.error }}</span>
          <span v-else>{{ t('auth.error') }}</span>
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" class="w-full px-4 md:px-0 md:w-[700px]">
        <div class="flex flex-col md:flex-row border-[#779E7E] border rounded-xl mt-6 md:h-[500px]">
          <div class="w-full md:w-1/2 hidden md:block">
            <img
              :src="background"
              class="h-full w-full object-cover rounded-l-xl"
              alt="image background forgot password page"
            />
          </div>
          <div class="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-10">
            <!-- Instructions -->
            <div class="w-full mb-6">
              <p class="text-[#5C4741] text-sm md:text-base font-altone text-center">
                {{ t('auth.resetPasswordInstructions') }}
              </p>
            </div>

            <!-- Email field -->
            <div class="flex flex-col items-start gap-1 w-full">
              <label class="font-altone text-sm md:text-base font-normal" for="email">
                {{ t('auth.email') }}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                v-model="form.email"
                required
                class="rounded-sm p-2 w-full border border-[#5C4741] h-7"
                :class="{
                  'border-red-500': form.errors.email,
                }"
                :disabled="form.processing"
                :placeholder="t('auth.emailPlaceholder')"
              />
              <div v-if="form.errors.email" class="w-full">
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
                  <span>{{ form.errors.email }}</span>
                </p>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4 md:gap-7 mt-8 md:mt-12 w-full flex-col md:flex-row">
              <Link
                href="/login"
                class="bg-[#D6B7B0] px-4 py-2 rounded-lg font-altone text-sm md:text-base text-black flex-1 cursor-pointer text-center"
              >
                {{ t('auth.backToLogin') }}
              </Link>
              <button
                type="submit"
                :disabled="form.processing"
                class="bg-[#5C4741] text-white px-4 py-2 rounded-lg font-altone text-sm md:text-base flex-1 cursor-pointer disabled:opacity-50"
              >
                <span v-if="form.processing">{{ t('common.loading') }}...</span>
                <span v-else>{{ t('auth.sendResetLink') }}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </Layout>
</template>
