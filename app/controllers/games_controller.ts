import type { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'

export default class GamesController {
  public async index({ inertia }: HttpContext) {
    const games = await Game.query().orderBy('name', 'asc')

    return inertia.render('games/index', {
      games,
    })
  }

  public async api({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sort = request.input('sort', 'closest')

    const baseQuery = Game.query()

    switch (sort) {
      case 'furthest':
        baseQuery.orderBy('name', 'desc')
        break
      case 'closest':
        baseQuery.orderBy('name', 'asc')
        break
      case 'platform':
        baseQuery.orderBy('plateform', 'asc')
        break
    }

    const games = await baseQuery.paginate(page, limit)
    return games.toJSON().data
  }
}
