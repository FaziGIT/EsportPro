import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'

export default class TournamentsController {
  public async index({ inertia }: HttpContext) {
    const tournaments = await Tournament.query().orderBy('start_date', 'asc')

    return inertia.render('tournaments/index', {
      tournaments,
    })
  }

  public async api({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const tournaments = await Tournament.query().orderBy('start_date', 'asc').paginate(page, limit)

    return response.json(tournaments.toJSON().data)
  }
}
