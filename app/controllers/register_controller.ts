import { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/auth'
import User from '#models/user'

export default class RegisterController {
  public index({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  public async store({ request, auth, i18n, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    const user = await User.create({
      ...data,
      isPrivate: false,
    })

    await auth.use('web').login(user)

    return response.redirect().toRoute('/')
  }
}
