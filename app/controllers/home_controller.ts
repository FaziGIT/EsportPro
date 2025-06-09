import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import Game from '#models/game'

export default class HomeController {
  public async index({ inertia }: HttpContext) {
    const tournaments = await Tournament.query().orderBy('created_at', 'desc').limit(10)
    const games = await Game.query().limit(20)

    return inertia.render('home/index', {
      title: 'Home',
      description: 'Welcome to the home page!',
      tournaments,
      games,
    })
  }
}
