import type { HttpContext } from '@adonisjs/core/http'

export default class ErrorsController {
  public async unauthorized({ inertia }: HttpContext) {
    return inertia.render('errors/unauthorized')
  }
}
