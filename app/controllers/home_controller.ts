import type { HttpContext } from '@adonisjs/core/http'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import { getAllGamesWithoutImages } from '../repository/game.js'
import User from '#models/user'

export default class HomeController {
  public async index({ inertia }: HttpContext) {
    const tournaments = await getAllTournamentsWithoutImages()
      .where('is_validated', true)
      .orderBy('start_date', 'asc')
      .limit(10)

    const games = await getAllGamesWithoutImages().limit(15)

    return inertia.render('home/index', {
      tournaments,
      games,
    })
  }

  public async search({ request }: HttpContext) {
    const { query } = request.all()

    const tournaments = await getAllTournamentsWithoutImages()
      .where('is_validated', true)
      .where('name', 'like', `%${query}%`)
      .limit(5)

    const games = await getAllGamesWithoutImages().where('name', 'like', `%${query}%`).limit(5)

    const users = await User.query().where('pseudo', 'like', `%${query}%`).limit(5)

    return { tournaments, games, users }
  }
}
