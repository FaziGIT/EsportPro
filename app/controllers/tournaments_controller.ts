import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { dd } from '@adonisjs/core/services/dumper'
import { tournamentValidator } from '#validators/tournament'
import { UserRole } from '#enums/user_role'

export default class TournamentsController {
  public async index({ inertia, auth }: HttpContext) {
    const tournaments = await Tournament.query().orderBy('start_date', 'asc')

    const isAdmin = auth.user?.role === UserRole.Admin

    if (!isAdmin) {
      return inertia.render('tournaments/index', {
        tournaments,
      })
    }

    const games = await Game.query().select('id', 'name').orderBy('name', 'asc')

    return inertia.render('tournaments/index', {
      tournaments,
      games,
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

  public async store({ request, i18n, response }: HttpContext) {
    dd(request.all())
    // Faire la logique, que si le isOnline est a true, alors on ne doit pas remplir les champs region, address, city, country, postalCode

    const data = await request.validateUsing(tournamentValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })
    dd(data)

    return response.redirect().toRoute('/')
  }
}
