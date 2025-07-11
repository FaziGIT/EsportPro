import type { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'
import { BufferToUint8Array, Uint8ArrayToBuffer } from '#services/transform_image.ts'
import { getAllGamesWithoutImages } from '../repository/game.js'
import { gameValidator } from '#validators/game'

export default class GamesController {
  public async index({ inertia }: HttpContext) {
    const games = await getAllGamesWithoutImages().orderBy('name', 'asc')

    return inertia.render('games/index', {
      games,
    })
  }

  public async api({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sort = request.input('sort', 'closest')

    const baseQuery = getAllGamesWithoutImages()

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

  public async store({ request, i18n, response }: HttpContext) {
    const data = await request.validateUsing(gameValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    const gameModel: Partial<Game> = {
      name: data.name,
      platform: data.platform,
    }

    // If the image is provided, we read the temporary file and convert it to a Uint8Array
    if (data.image) {
      gameModel.image = BufferToUint8Array(data.image.tmpPath!)
    }

    await Game.create(gameModel)

    return response.redirect().toRoute('/')
  }

  /**
   * Endpoint to retrieve the image of a game
   */
  async getImageFromGame({ params, response }: HttpContext) {
    try {
      const tournament = await Game.query().select('image').where('id', params.id).first()

      return Uint8ArrayToBuffer({
        model: tournament,
        response,
      })
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }
}
