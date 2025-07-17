import type { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'
import { BufferToUint8Array, Uint8ArrayToBuffer } from '#services/transform_image.ts'
import { getAllGamesWithoutImages } from '../repository/game.js'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import { gameUpdateValidator, gameValidator } from '#validators/game'
import User from '#models/user'
import { UserRole } from '#enums/user_role'
import TournamentService from '#services/tournament_service'
import { FilterOptions } from '#enums/filter'

export default class GamesController {
  public async index({ inertia }: HttpContext) {
    return inertia.render('games/index')
  }

  public async api({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sort = request.input('sort', FilterOptions.ASC_NAME)

    const baseQuery = getAllGamesWithoutImages().preload('favoriteOfUsers')

    switch (sort) {
      case FilterOptions.DESC_NAME:
        baseQuery.orderByRaw('LOWER(name) DESC')
        break
      case FilterOptions.ASC_NAME:
        baseQuery.orderByRaw('LOWER(name) ASC')
        break
      case FilterOptions.ASC_PLATFORM:
        baseQuery.orderByRaw('LOWER(platform) ASC')
        break
      case FilterOptions.DESC_PLATFORM:
        baseQuery.orderByRaw('LOWER(platform) DESC')
        break
    }

    const games = await baseQuery.paginate(page, limit)
    return games.toJSON().data
  }

  public async store({ request, i18n, response }: HttpContext) {
    try {
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

      if (request.accepts(['html', 'json']) === 'json') {
        return response.json({
          success: true,
          message: 'Game created successfully',
        })
      }
      return response.redirect().back()
    } catch (error) {
      console.error('Error creating game:', error)

      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(500).json({
          error: true,
          message: 'An error occurred while creating the game',
        })
      }

      return response.status(500).json({
        error: true,
        message: 'An error occurred while creating the game',
      })
    }
  }

  public async show({ params, inertia }: HttpContext) {
    if (!params.id) {
      throw new Error('Game ID is required')
    }

    const game = await getAllGamesWithoutImages()
      .where('id', params.id)
      .preload('favoriteOfUsers')
      .firstOrFail()

    // Get all tournaments for this game, sorted by start date (closest first)
    const tournaments = await getAllTournamentsWithoutImages()
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

  public async update({ params, request, i18n, response, auth }: HttpContext) {
    if (!params.id) {
      throw new Error('Game ID is required')
    }

    const user = auth.user!
    if (user.role !== UserRole.Admin) {
      return response.status(403).json({
        error: true,
        message:
          'You are not authorized to update this game. Only administrators can modify games.',
      })
    }

    try {
      const game = await Game.query().where('id', params.id).firstOrFail()

      const data = await request.validateUsing(gameUpdateValidator, {
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

      // Update the game
      await game.merge(gameModel).save()
      return response.redirect().back()
    } catch (error) {
      console.error('Error updating game:', error)
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(500).json({
          error: true,
          message: 'An error occurred while updating the game',
        })
      }

      return response.status(500).json({
        error: true,
        message: 'An error occurred while updating the game',
      })
    }
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

  public async deleteGame({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== UserRole.Admin) {
      return response.status(403).json({
        error: true,
        message: 'Unauthorized access',
      })
    }

    try {
      const game = await getAllGamesWithoutImages()
        .where('id', params.id)
        .preload('favoriteOfUsers')
        .firstOrFail()

      // Récupérer les tournois associés au jeu
      const tournaments = await getAllTournamentsWithoutImages()
        .where('game_id', params.id)
        .select('id')

      for (const tournament of tournaments) {
        await TournamentService.deleteTournamentById(tournament.id, user)
      }

      // Détacher le jeu des utilisateurs qui l'ont mis en favori
      if (game.favoriteOfUsers && game.favoriteOfUsers.length > 0) {
        const userIds = game.favoriteOfUsers.map((u) => u.id)
        await game.related('favoriteOfUsers').detach(userIds)
      }

      // Supprimer le jeu
      await game.delete()

      return response.json({
        success: true,
        message: 'Game successfully deleted with all related tournaments',
      })
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: 'An error occurred while deleting the game',
      })
    }
  }
}
