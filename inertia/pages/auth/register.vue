<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import background from '~/img/auth/bg.png'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import { useI18n } from '../../../resources/js/composables/useI18n'

const page = usePage()

const form = useForm({
  pseudo: null,
  email: null,
  password: null,
})

const { t } = useI18n()
</script>

<template>
  <Head :title="t('auth.register')" />

  <Layout>
    <div class="flex mt-16 flex-col items-center">
      <h1 class="text-4xl md:text-6xl font-altone">{{ t('auth.register') }}</h1>

      <form @submit.prevent="form.post('/register')" class="w-full px-4 md:px-0 md:w-[700px]">
        <div class="flex flex-col md:flex-row border-[#779E7E] border rounded-xl mt-6 md:h-[500px]">
          <div class="w-full md:w-1/2 hidden md:block">
            <img
              :src="background"
              class="h-full w-full object-cover rounded-l-xl"
              alt="image background register and login page"
            />
          </div>
          <div class="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-10">
            <div class="flex flex-col items-start gap-1 w-full">
              <label class="font-altone text-sm md:text-base font-normal" for="pseudo">{{
                t('auth.pseudo')
              }}</label>
              <input
                type="text"
                id="pseudo"
                name="pseudo"
                v-model="form.pseudo"
                class="rounded-sm p-2 w-full border border-[#5C4741] h-7"
                :class="{
                  'border-red-500': form.errors.pseudo,
                }"
              />
              <div v-if="form.errors.pseudo" class="w-full">
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
                  <span>{{ form.errors.pseudo }}</span>
                </p>
              </div>
            </div>
            <div class="flex flex-col items-start mt-4 gap-1 w-full">
              <label class="font-altone text-sm md:text-base font-normal" for="email">{{
                t('auth.email')
              }}</label>
              <input
                type="email"
                id="email"
                name="email"
                v-model="form.email"
                class="rounded-sm p-2 w-full border border-[#5C4741] h-7"
                :class="{
                  'border-red-500': form.errors.email,
                }"
              />
              <div v-if="form.errors.email" class="w-full">
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
                  <span>{{ form.errors.email }}</span>
                </p>
              </div>
            </div>

            <div class="flex flex-col items-start mt-4 gap-1 w-full">
              <label class="font-altone text-sm md:text-base font-normal" for="password">{{
                t('auth.password')
              }}</label>
              <input
                type="password"
                id="password"
                name="password"
                v-model="form.password"
                class="rounded-sm p-2 w-full border border-[#5C4741] h-7"
                :class="{
                  'border-red-500': form.errors.password,
                }"
              />
              <div v-if="form.errors.password" class="w-full">
                <p class="text-xs text-red-500 font-medium flex items-start">
                  <span>{{ form.errors.password }}</span>
                </p>
              </div>
            </div>

            <div class="flex gap-4 mt-12 w-full">
              <Link
                href="/login"
                class="bg-[#D6B7B0] text-black px-4 py-2 mt-4 rounded-lg font-altone cursor-pointer"
              >
                <svg
                  width="23px"
                  height="23px"
                  viewBox="0 0 1024 1024"
                  fill="#000000"
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z"
                      fill=""
                    ></path>
                  </g>
                </svg>
              </Link>
              <button
                type="submit"
                class="bg-[#5C4741] text-white px-4 py-2 mt-4 rounded-lg font-altone flex-1 cursor-pointer text-center"
                :disabled="form.processing"
              >
                {{ t('auth.register') }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </Layout>
</template>
