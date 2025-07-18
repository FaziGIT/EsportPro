import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { twofaValidator } from '#validators/twofa'

export default class TwofaController {
  /**
   * Enable 2FA for user
   */
  public async enable({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.is2faEnabled) {
      return response.badRequest({ message: '2FA is already enabled' })
    }

    const { secret, qrCodeUrl, recoveryCodes } = await user.setupTwoFa()

    return response.ok({
      secret,
      qrCodeUrl,
      recoveryCodes,
    })
  }

  /**
   * Confirm 2FA setup
   */
  public async confirm({ auth, request, response, i18n }: HttpContext) {
    const user = auth.user!

    const data = await request.validateUsing(twofaValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    const isValid = await user.confirmTwoFa(data.code)

    if (!isValid) {
      return response.badRequest({ message: 'Invalid 2FA code' })
    }

    return response.ok({ message: '2FA enabled successfully' })
  }

  /**
   * Verify 2FA code during login
   */
  public async verify({ request, response, session, auth, i18n }: HttpContext) {
    const data = await request.validateUsing(twofaValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    const pendingUserId = session.get('pending_2fa_user_id')
    if (!pendingUserId) {
      return response.badRequest({ message: 'No pending 2FA verification' })
    }

    const user = await User.findOrFail(pendingUserId)

    // Check if it's a recovery code
    const isRecoveryCode = data.code.length === 8 && /^[A-F0-9]+$/.test(data.code.toUpperCase())

    let isValid = false
    if (isRecoveryCode) {
      isValid = await user.verifyRecoveryCode(data.code)
    } else {
      isValid = user.verifyTwoFaCode(data.code)
    }

    if (!isValid) {
      return response.badRequest({ message: 'Invalid 2FA code' })
    }

    // Clear pending session and complete login
    session.forget('pending_2fa_user_id')
    session.put('2fa_verified', user.id)
    await auth.use('web').login(user)

    return response.redirect().toPath('/')
  }

  /**
   * Disable 2FA
   */
  public async disable({ auth, request, response, i18n }: HttpContext) {
    const user = auth.user!

    if (!user.is2faEnabled) {
      return response.badRequest({ message: '2FA is not enabled' })
    }

    const data = await request.validateUsing(twofaValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    const isValid = user.verifyTwoFaCode(data.code)

    if (!isValid) {
      return response.badRequest({ message: 'Invalid 2FA code' })
    }

    await user.disableTwoFa()

    return response.ok({ message: '2FA disabled successfully' })
  }

  /**
   * Get 2FA status
   */
  public async status({ auth, response }: HttpContext) {
    const user = auth.user!

    return response.ok({
      is2faEnabled: user.is2faEnabled,
      hasTwoFaEnabled: user.hasTwoFaEnabled,
      recoveryCodesCount: user.getRecoveryCodesCount(),
    })
  }
}
