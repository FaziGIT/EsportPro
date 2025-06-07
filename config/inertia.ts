import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    user: (ctx) => ctx.inertia.always(() => ctx.auth.user),
    i18n: (ctx) => {
      return {
        ...ctx.i18n,
        locale: ctx.i18n.locale,
      }
    },

    ssr: {
      enabled: true,
      entrypoint: 'inertia/app/ssr.ts',
    },
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
