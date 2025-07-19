import { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/auth'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'

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

    const appUrl = `${request.protocol()}://${request.host()}`

    await mail.sendLater((message) => {
      message.to(user.email).from('mailing.mathis@gmail.com').subject('Welcome to EsportPro !')
        .html(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #5C4741; margin: 0; font-size: 28px; font-weight: bold;">Welcome to EsportPro!</h1>
                  <div style="width: 50px; height: 3px; background-color: #D6B7B0; margin: 15px auto;"></div>
                </div>

                <div style="margin-bottom: 25px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">Hello <strong>${user.pseudo}</strong>,</p>
                </div>

                <div style="margin-bottom: 25px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                    🎮 Welcome to the ultimate esports platform! We're thrilled to have you join our community of passionate gamers and tournament enthusiasts.
                  </p>
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                    Your account has been successfully created and you're now ready to:
                  </p>
                </div>

                <div style="background-color: #CBD3CD; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                  <ul style="margin: 0; padding-left: 20px; color: #5C4741;">
                    <li style="margin-bottom: 8px; font-size: 15px;">🏆 <strong>Join tournaments</strong> and compete with players worldwide</li>
                    <li style="margin-bottom: 8px; font-size: 15px;">🎯 <strong>Create your own tournaments</strong> and build your community</li>
                    <li style="margin-bottom: 8px; font-size: 15px;">📊 <strong>Track your progress</strong> with detailed statistics</li>
                    <li style="margin-bottom: 8px; font-size: 15px;">🎮 <strong>Discover new games</strong> and add them to your favorites</li>
                    <li style="margin-bottom: 0; font-size: 15px;">👥 <strong>Connect with fellow gamers</strong> and make new friends</li>
                  </ul>
                </div>

                <div style="text-align: center; margin-bottom: 25px;">
                  <a href="${appUrl}" style="display: inline-block; background-color: #5C4741; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Start Your Gaming Journey
                  </a>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                  <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 10px 0;">
                    Need help getting started? Our community is here to support you every step of the way.
                  </p>
                  <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                    Happy gaming!<br>
                    <strong>The EsportPro Team</strong>
                  </p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This email was sent to ${user.email}. If you didn't create an account, please ignore this email.
                </p>
              </div>
            </div>
          `)
    })

    return response.redirect().toRoute('/')
  }
}
