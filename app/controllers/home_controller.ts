import type { HttpContext } from '@adonisjs/core/http'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import { getAllGamesWithoutImages } from '../repository/game.js'
import User from '#models/user'

export default class HomeController {
  public async index({ inertia }: HttpContext) {
    const tournaments = await getAllTournamentsWithoutImages()
      .preload('game', (query) => {
        query.select('id', 'name')
      })
      .where('is_validated', true)
      .orderBy('start_date', 'asc')
      .limit(10)

    const games = await getAllGamesWithoutImages().preload('favoriteOfUsers').limit(15)

    const allGames = await getAllGamesWithoutImages().orderBy('name', 'asc')

    return inertia.render('home/index', {
      tournaments,
      games,
      allGames,
    })
  }

  public async search({ request }: HttpContext) {
    const { query } = request.all()

    const tournaments = await getAllTournamentsWithoutImages()
      .where('is_validated', true)
      .whereRaw('LOWER(name) LIKE ?', [`%${query.toLowerCase()}%`])
      .limit(5)

    const games = await getAllGamesWithoutImages()
      .whereRaw('LOWER(name) LIKE ?', [`%${query.toLowerCase()}%`])
      .limit(5)

    const users = await User.query()
      .whereRaw('LOWER(pseudo) LIKE ?', [`%${query.toLowerCase()}%`])
      .limit(5)

    return { tournaments, games, users }
  }
}
