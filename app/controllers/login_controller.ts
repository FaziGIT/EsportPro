import { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/auth'
import User from '#models/user'

export default class LoginController {
  public index({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  public async store({ request, response, auth, i18n }: HttpContext) {
    const data = await request.validateUsing(loginValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    const user = await User.verifyCredentials(data.emailPseudo, data.password)

    await auth.use('web').login(user)
    return response.redirect().toPath('/')
  }
}
