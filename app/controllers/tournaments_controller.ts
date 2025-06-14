import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'

export default class TournamentsController {
  public async index({ inertia }: HttpContext) {
    const tournaments = await Tournament.query().orderBy('start_date', 'asc')

    return inertia.render('tournaments/index', {
      tournaments,
    })
  }
}
