import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import mail from '@adonisjs/mail/services/main'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/reset_password'

export default class ResetPasswordsController {
  /**
   * Show the reset password request page
   */
  public async showForgotPasswordForm(ctx: HttpContext) {
    return ctx.inertia.render('auth/forgot-password')
  }

  /**
   * Send a reset password email
   */
  public async sendResetPasswordEmail(ctx: HttpContext) {
    const { email } = await ctx.request.validateUsing(forgotPasswordValidator)

    const user = await User.findBy('email', email)

    // Always return success, even if the email does not exist, to avoid leaking information
    if (!user) {
      return ctx.inertia.render('auth/forgot-password', {
        success: true,
      })
    }

    // Check if a token has already been sent less than a minute ago
    const recentToken = await PasswordResetToken.getRecentUnusedToken(user, 60)
    if (recentToken) {
      return ctx.inertia.render('auth/forgot-password', {
        error: ctx.i18n.t('auth.recentEmailSent'),
      })
    }

    // Generate a reset token
    const resetToken = await PasswordResetToken.generateForUser(user)

    // Build the reset URL
    const resetUrl = `${ctx.request.completeUrl().replace(ctx.request.url(), '')}/reset-password/${resetToken.token}`

    // Send the email in the background with BullMQ
    await mail.sendLater((message) => {
      message
        .to(email)
        .from('mailing.mathis@gmail.com') // IMPORTANT: Validated email in Brevo
        .subject('Reset your password - EsportPro').html(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Reset your password</h2>
              <p>Hello ${user.pseudo},</p>
              <p>You have requested to reset your password on EsportPro.</p>
              <p>Click the link below to create a new password:</p>
              <p style="margin: 20px 0;">
                <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  Reset my password
                </a>
              </p>
              <p><strong>This link expires in 1 hour.</strong></p>
              <p>If you did not request this reset, please ignore this email.</p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                If the button doesn't work, copy this link into your browser:<br>
                ${resetUrl}
              </p>
            </div>
          `)
    })

    return ctx.inertia.render('auth/forgot-password', {
      success: true,
    })
  }

  /**
   * Show the reset password form (or return the token info)
   */
  public async showResetForm(ctx: HttpContext) {
    if (ctx.auth.user) {
      return ctx.response.redirect().toRoute('/')
    }

    const { token } = ctx.params

    const user = await PasswordResetToken.validateToken(token)

    if (!user) {
      return ctx.inertia.render('auth/reset-password', {
        token,
        error: ctx.i18n.t('auth.invalidToken'),
      })
    }

    return ctx.inertia.render('auth/reset-password', {
      token,
      email: user.email,
    })
  }

  /**
   * Reset the password
   */
  public async resetPassword(ctx: HttpContext) {
    const { token } = ctx.params
    const { password } = await ctx.request.validateUsing(resetPasswordValidator)

    const user = await PasswordResetToken.validateToken(token)

    if (!user) {
      return ctx.inertia.render('auth/reset-password', {
        token,
        error: ctx.i18n.t('auth.invalidToken'),
      })
    }

    // Documentation : The AuthFinder mixin registers a beforeSave hook to automatically hash the user passwords during INSERT and UPDATE calls. Therefore, you do not have to manually perform password hashing in your models.
    user.password = password

    await user.save()

    await PasswordResetToken.markAsUsed(token)

    await mail.sendLater((message) => {
      message.to(user.email).from('mailing.mathis@gmail.com').subject('Password Reset - EsportPro')
        .html(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset Successfully</h2>
              <p>Hello ${user.pseudo},</p>
              <p>Your password has been reset successfully.</p>
              <p>If you didn't initiate this action, please contact us immediately.</p>
            </div>
          `)
    })

    return ctx.inertia.render('auth/reset-password', {
      token,
      success: true,
    })
  }
}
