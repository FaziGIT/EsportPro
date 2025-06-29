import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import Team from '#models/team'
import Match from '#models/match'

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

  public async show({ params, inertia }: HttpContext) {
    if (!params.id) {
      throw new Error('Tournament ID is required')
    }

    const tournament = await Tournament.query().where('id', params.id).firstOrFail()
    const teams = await Team.query().where('tournament_id', params.id)

    // Fetch matches with team data and winners
    const matches = await Match.query()
      .where('tournament_id', params.id)
      .preload('team1')
      .preload('team2')
      .preload('winner')
      .orderBy('created_at', 'asc')

    return inertia.render('tournaments/show', { tournament, teams, matches })
  }
}
