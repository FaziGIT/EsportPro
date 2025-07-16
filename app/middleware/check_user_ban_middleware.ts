import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CheckUserBanMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    try {
      await auth.authenticate()

      if (auth.user?.role === UserRole.Banned) {
        return response.redirect('/unauthorized')
      }
    } catch {}

    await next()
  }
}
