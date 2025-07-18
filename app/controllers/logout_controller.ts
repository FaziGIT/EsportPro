import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutController {
  async handle({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.forget('2fa_verified')
    session.forget('pending_2fa_user_id')

    return response.redirect().toPath('/')
  }
}
