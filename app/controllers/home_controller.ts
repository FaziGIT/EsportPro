import type { HttpContext } from '@adonisjs/core/http'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import { getAllGamesWithoutImages } from '../repository/game.js'

export default class HomeController {
  public async index({ inertia }: HttpContext) {
    const tournaments = await getAllTournamentsWithoutImages()
      .orderBy('start_date', 'asc')
      .limit(10)

    const games = await getAllGamesWithoutImages().limit(15)

    return inertia.render('home/index', {
      tournaments,
      games,
    })
  }
}
