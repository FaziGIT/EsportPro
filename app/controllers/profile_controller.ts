import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  public async index({ inertia, auth }: HttpContext) {
    const user = auth.user
    return inertia.render('profile/index', {
      user: user,
    })
  }

  public async updatePrivacy({ request, auth, response }: HttpContext) {
    const user = auth.user
    const isPrivate = request.input('isPrivate')

    if (user) {
      user.isPrivate = isPrivate
      await user.save()
    }

    return response.redirect().back()
  }
}
