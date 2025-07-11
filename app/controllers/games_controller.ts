import type { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'
import { BufferToUint8Array, Uint8ArrayToBuffer } from '#services/transform_image.ts'
import { getAllGamesWithoutImages } from '../repository/game.js'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import { gameValidator } from '#validators/game'
import User from '#models/user'

export default class GamesController {
  public async index({ inertia }: HttpContext) {
    return inertia.render('games/index')
  }

  public async api({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sort = request.input('sort', 'closest')

    const baseQuery = getAllGamesWithoutImages().preload('favoriteOfUsers')

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

  public async show({ params, inertia }: HttpContext) {
    if (!params.id) {
      throw new Error('Game ID is required')
    }

    const game = await getAllGamesWithoutImages().where('id', params.id).firstOrFail()

    // Get all tournaments for this game, sorted by start date (closest first)
    const tournaments = await getAllTournamentsWithoutImages()
      .preload('game')
      .where('game_id', params.id)
      .where('is_validated', true)
      .orderBy('start_date', 'asc')

    return inertia.render('games/show', { game, tournaments })
  }

  public async toggleFavorite({ params, auth, response }: HttpContext) {
    const game = await getAllGamesWithoutImages()
      .where('id', params.id)
      .preload('favoriteOfUsers')
      .firstOrFail()
    let message = 'Favorite toggled'
    if (
      game.favoriteOfUsers &&
      game.favoriteOfUsers.some((user: User) => user.id === auth.user?.id)
    ) {
      await game.related('favoriteOfUsers').detach([auth.user?.id as string]) // string cause of uuid
      message = 'Favorite removed'
    } else {
      await game.related('favoriteOfUsers').attach([auth.user?.id as string])
    }

    return response.status(200).json({ message })
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
