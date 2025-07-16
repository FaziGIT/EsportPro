/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import type { DefineComponent } from 'vue'
import { createSSRApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

import * as Sentry from '@sentry/vue'

import { createPinia } from 'pinia'

const pinia = createPinia()

const appName = 'EsportPro'

void createInertiaApp({
  progress: { color: '#5468FF' },

  title: (title) => (title ? `${title} - ${appName}` : appName),

  resolve: (name) => {
    return resolvePageComponent(
      `../pages/${name}.vue`,
      import.meta.glob<DefineComponent>('../pages/**/*.vue')
    )
  },

  setup({ el, App, props, plugin }) {
    const app = createSSRApp({ render: () => h(App, props) })

    app.use(plugin)
    app.use(pinia)

    Sentry.init({
      app,
      dsn: 'https://bba62dbf56744534b206f21ca52aebd9@glitchtip.esportpro.cloud/1', // Voir la section 2 ci-dessous
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 0.01,
      environment: 'prod',
      release: 'v1.0.0',
    })

    app.mount(el)
  },
})
