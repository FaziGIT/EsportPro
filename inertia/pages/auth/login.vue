<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import background from '~/img/auth/bg.png'
import { Link, useForm, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import { useI18n } from '../../../resources/js/composables/useI18n'

const page = usePage()

const errors = computed(() => page.props.errors)

const form = useForm({
  emailPseudo: null,
  password: null,
})

const { t } = useI18n()
</script>

<template>
  <Layout>
    <div class="flex mt-16 flex-col items-center">
      <h1 class="text-6xl font-altone">{{ t('auth.login') }}</h1>

      <div
        v-if="errors && errors.E_INVALID_CREDENTIALS"
        class="w-[700px] mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"
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
          <span>{{ t('auth.invalidCredentials') }}</span>
        </p>
      </div>

      <form @submit.prevent="form.post('/login')">
        <div class="flex w-[700px] border-[#779E7E] border rounded-xl mt-6">
          <div class="w-1/2">
            <img :src="background" alt="image background login page" />
          </div>
          <div class="w-1/2 flex flex-col items-center justify-center p-10">
            <div class="flex flex-col items-start gap-1 w-full">
              <label class="font-altone font-normal" for="email">
                {{ t('auth.emailPseudo') }}
              </label>
              <input
                type="text"
                id="email"
                name="email"
                v-model="form.emailPseudo"
                class="rounded-sm p-2 w-full border border-[#5C4741] h-7"
                :class="{
                  'border-red-500':
                    form.errors.emailPseudo || (errors && errors.E_INVALID_CREDENTIALS),
                }"
              />
              <div v-if="form.errors.emailPseudo" class="w-full">
                <p class="text-xs text-red-500 font-medium flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13px"
                    height="13px"
                    fill="currentColor"
                    class="mr-1.5 mt-[1.5px] flex-shrink-0"
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="M256 0C114.833 0 0 114.833 0 256s114.833 256 256 256 256-114.853 256-256S397.167 0 256 0zm0 472.341c-119.275 0-216.341-97.046-216.341-216.341S136.725 39.659 256 39.659c119.295 0 216.341 97.046 216.341 216.341S375.275 472.341 256 472.341z"
                    />
                    <path
                      d="M373.451 166.965c-8.071-7.337-20.623-6.762-27.999 1.348L224.491 301.509 166.053 242.1c-7.714-7.813-20.246-7.932-28.039-.238-7.813 7.674-7.932 20.226-.238 28.039l73.151 74.361a19.804 19.804 0 0 0 14.138 5.929c.119 0 .258 0 .377.02a19.842 19.842 0 0 0 14.297-6.504l135.059-148.722c7.358-8.131 6.763-20.663-1.347-28.02z"
                    />
                  </svg>
                  <span>{{ form.errors.emailPseudo }}</span>
                </p>
              </div>
            </div>

            <div class="flex flex-col items-start mt-4 gap-1 w-full">
              <label class="font-altone font-normal" for="password">{{ t('auth.password') }}</label>
              <input
                type="password"
                id="password"
                name="password"
                v-model="form.password"
                class="rounded-sm p-2 w-full border border-[#5C4741] h-7"
                :class="{
                  'border-red-500':
                    form.errors.password || (errors && errors.E_INVALID_CREDENTIALS),
                }"
              />
              <div v-if="form.errors.password" class="w-full">
                <p class="text-xs text-red-500 font-medium flex items-start">
                  <span>{{ form.errors.password }}</span>
                </p>
              </div>
            </div>

            <Link
              href="#"
              class="text-[#5C4741] underline decoration-[#5C4741] underline-offset-6 font-altone mt-8 text-sm"
            >
              {{ t('auth.forgotPassword') }}
            </Link>

            <div class="flex gap-7 mt-12 w-full">
              <Link
                href="/register"
                class="bg-[#D6B7B0] px-4 py-2 mt-4 rounded-lg font-altone text-black flex-1 cursor-pointer text-center"
              >
                {{ t('auth.register') }}
              </Link>
              <button
                type="submit"
                :disabled="form.processing"
                class="bg-[#5C4741] text-white px-4 py-2 mt-4 rounded-lg font-altone flex-1 cursor-pointer"
              >
                {{ t('auth.connection') }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </Layout>
</template>
