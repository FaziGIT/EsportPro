import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  public async index({ inertia }: HttpContext) {
    return inertia.render('profile/index')
  }
}
