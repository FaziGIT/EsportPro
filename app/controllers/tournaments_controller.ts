import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { tournamentValidator } from '#validators/tournament'
import { UserRole } from '#enums/user_role'
import { BufferToUint8Array, Uint8ArrayToBuffer } from '#services/transform_image.ts'
import { DateTime } from 'luxon'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'

export default class TournamentsController {
  public async index({ inertia, auth }: HttpContext) {
    const isAdmin = auth.user?.role === UserRole.Admin

    if (!isAdmin) {
      return inertia.render('tournaments/index')
    }

    // Fetch all games to display in the dropdown when creating new tournament
    const games = await Game.query().select('id', 'name').orderBy('name', 'asc')

    return inertia.render('tournaments/index', {
      games,
    })
  }

  public async api({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sort = request.input('sort', 'closest')

    const baseQuery = getAllTournamentsWithoutImages().preload('game')

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
    const data = await request.validateUsing(tournamentValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    const tournamentModel: Partial<Tournament> = {
      name: data.name,
      tier: data.tier,
      format: data.format,
      price: data.price,
      rules: data.rules,
      numberParticipants: data.numberParticipants,
      startDate: DateTime.fromJSDate(data.startDate),
      endDate: DateTime.fromJSDate(data.endDate),
      winnerId: null,
      gameId: data.gameId,
    }

    if (data.isOnline) {
      tournamentModel.region = null
      tournamentModel.address = null
      tournamentModel.city = null
      tournamentModel.country = null
      tournamentModel.postalCode = null
    } else {
      // If not online, we need to fill the region, address, city, country and postalCode, who are checked in the validator
      tournamentModel.region = data.region!
      tournamentModel.address = data.address!
      tournamentModel.city = data.city!
      tournamentModel.country = data.country!
      tournamentModel.postalCode = data.postalCode!
    }

    // If the tournament is team mode, we set the numberPlayersPerTeam, otherwise we set it to null
    if (data.teamMode) {
      tournamentModel.numberPlayersPerTeam = data.numberPlayersPerTeam!
    } else {
      tournamentModel.numberPlayersPerTeam = null
    }

    // If the image is provided, we read the temporary file and convert it to a Uint8Array
    if (data.image) {
      tournamentModel.image = BufferToUint8Array(data.image.tmpPath!)
    }

    const game = await Game.find(data.gameId) // Find because we check in the validator, so it's not null

    const tournament = await Tournament.create(tournamentModel)

    await tournament.related('game').associate(game!)

    return response.redirect().toRoute('/')
  }

  public async launch({}: HttpContext) {} // TODO: Implement the logic to launch a tournament, e.g., create first matches, create all the channels, etc.

  /**
   * Endpoint to retrieve the image of a tournament
   */
  async getImageFromTournament({ params, response }: HttpContext) {
    try {
      const tournament = await Tournament.query().select('image').where('id', params.id).first()

      return Uint8ArrayToBuffer({
        model: tournament,
        response,
      })
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }
}
