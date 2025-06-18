import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'

export default class TournamentsController {
  public async index({ inertia }: HttpContext) {
    const tournaments = await Tournament.query().orderBy('start_date', 'asc')

    return inertia.render('tournaments/index', {
      tournaments,
    })
  }

  public async api({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sort = request.input('sort', 'closest')

    const baseQuery = Tournament.query().preload('game')

    switch (sort) {
      case 'furthest':
        baseQuery.orderBy('start_date', 'desc')
        break
      case 'closest':
        baseQuery.orderBy('start_date', 'asc')
        break
      case 'format':
        baseQuery.orderBy('format', 'asc')
        break
    }

    const tournaments = await baseQuery.paginate(page, limit)
    return tournaments.toJSON().data
  }
}
