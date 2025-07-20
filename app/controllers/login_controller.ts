import { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/auth'
import User from '#models/user'

export default class LoginController {
  public index({ inertia, session, request }: HttpContext) {
    const referer = request.header('referer')
    const isFromLogin = referer && referer.includes('/login')
    const isFromTwoFa = referer && referer.includes('/login/verify-2fa')

    if (!isFromLogin && !isFromTwoFa) {
      session.forget('pending_2fa_user_id')
    }

    const pendingTwoFa = session.get('pending_2fa_user_id')
    return inertia.render('auth/login', {
      pendingTwoFa: !!pendingTwoFa,
    })
  }

  public async clearTwoFa({ session, response }: HttpContext) {
    session.forget('pending_2fa_user_id')
    return response.redirect().toPath('/login')
  }

  public async store({ request, response, auth, session, i18n }: HttpContext) {
    const data = await request.validateUsing(loginValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    const user = await User.verifyCredentials(data.emailPseudo, data.password)

    if (user.hasTwoFaEnabled) {
      session.put('pending_2fa_user_id', user.id)
      return response.redirect().toPath('/login')
    }

    await auth.use('web').login(user)
    return response.redirect().toPath('/')
  }

  public async verify2fa({ request, response, session, auth }: HttpContext) {
    const { code } = request.only(['code'])

    const pendingUserId = session.get('pending_2fa_user_id')
    if (!pendingUserId) {
      return response.badRequest({ message: 'No pending 2FA verification' })
    }

    if (!code || code.trim() === '') {
      session.flashErrors({ code: ['Please enter a 2FA code'] })
      return response.redirect().back()
    }

    const user = await User.findOrFail(pendingUserId)
    const isRecoveryCode = code.length === 8 && /^[A-F0-9]+$/i.test(code)

    let isValid = false
    if (isRecoveryCode) {
      isValid = await user.verifyRecoveryCode(code)
    } else {
      isValid = user.verifyTwoFaCode(code)
    }

    if (!isValid) {
      const errorMessage = isRecoveryCode
        ? 'Invalid recovery code. Please check and try again.'
        : 'Invalid 2FA code. Please check your authenticator app and try again.'

      session.flashErrors({ code: [errorMessage] })
      return response.redirect().back()
    }

    session.forget('pending_2fa_user_id')
    session.put('2fa_verified', user.id)
    await auth.use('web').login(user)

    return response.redirect().toPath('/')
  }
}
