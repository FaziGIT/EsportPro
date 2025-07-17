import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import { UserRole } from '#enums/user_role'
import Game from '#models/game'
import User from '#models/user'
import { GameStatistic } from '#types/game_statistics'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import { getAllGamesWithoutImages } from '../repository/game.js'
import { userProfileValidator } from '#validators/user_validator'
import TournamentService from '../services/tournament_service.js'

export default class ProfileController {
  public async index({ inertia, auth, response }: HttpContext) {
    const user = auth.user!
    let tournaments: Tournament[] = []
    let favoriteGames: Game[] = []
    let pendingTournaments: Tournament[] = []
    let createdTournaments: Tournament[] = []
    let finishedTournaments: Tournament[] = []
    let gameStats: Record<string, GameStatistic> = {}
    let games: Game[] = []
    let allUsers: User[] = []

    if (user?.role === UserRole.Admin) {
      allUsers = await User.query().orderBy('created_at', 'desc')
    }

    // Récupérer tous les jeux disponibles pour le formulaire d'édition
    games = await getAllGamesWithoutImages().orderBy('name', 'asc')

    if (user) {
      // Charger les équipes de l'utilisateur
      await user.load('teams')
      await user.load('favoriteGames')

      // Utiliser le service pour récupérer les tournois
      const userTournaments = await TournamentService.getUserTournaments(user)
      tournaments = userTournaments.activeTournaments
      finishedTournaments = userTournaments.finishedTournaments
      const allUserTournaments = userTournaments.allTournaments

      // Calculer les statistiques par jeu en utilisant le service
      try {
        gameStats = TournamentService.calculateGameStatistics(allUserTournaments, user.id)
      } catch (error) {
        return response.status(500).json({
          error: true,
          message: 'An error occurred while calculating game statistics',
        })
      }

      // Récupération des jeux favoris de l'utilisateur
      favoriteGames = user.favoriteGames.slice().sort((a, b) => a.name.localeCompare(b.name))

      // Récupération des tournois en attente de validation pour les admins
      if (user.role === UserRole.Admin) {
        pendingTournaments = await getAllTournamentsWithoutImages()
          .where('isValidated', false)
          .preload('game', (gameQuery) => {
            gameQuery.select('id', 'name', 'platform')
          })
          .orderBy('created_at', 'asc')
      }

      // Récupération des tournois créés par l'utilisateur
      createdTournaments = await getAllTournamentsWithoutImages()
        .where('creatorId', user.id)
        .preload('game', (gameQuery) => {
          gameQuery.select('id', 'name', 'platform')
        })
        .orderBy('created_at', 'desc')

      return inertia.render('profile/index', {
        user: user,
        tournaments: tournaments,
        favoriteGames: favoriteGames,
        pendingTournaments: pendingTournaments,
        createdTournaments: createdTournaments,
        finishedTournaments: finishedTournaments,
        gameStats: gameStats,
        games: games,
        allUsers: allUsers,
      })
    }

    return inertia.render('profile/index', {
      user: user,
      tournaments: tournaments,
      favoriteGames: favoriteGames,
      pendingTournaments: [],
      createdTournaments: [],
      finishedTournaments: [],
      gameStats: {},
      games: games,
      allUsers: allUsers,
    })
  }

  public async updatePrivacy({ request, auth, response }: HttpContext) {
    const user = auth.user
    const isPrivate = request.input('isPrivate')

    if (user) {
      user.isPrivate = isPrivate
      await user.save()
    }

    return response.redirect().back()
  }

  public async updateName({ request, auth, response, i18n }: HttpContext) {
    // Valider les données avec le validateur personnalisé
    const data = await request.validateUsing(userProfileValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    // Mettre à jour les données de l'utilisateur
    auth.user!.firstName = data.firstName ?? null
    auth.user!.lastName = data.lastName ?? null
    await auth.user!.save()

    return response.redirect().back()
  }

  public async validateTournament({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== UserRole.Admin) {
      return response.status(401).json({
        error: true,
        message: 'Unauthorized access',
      })
    }

    try {
      const tournament = await getAllTournamentsWithoutImages().where('id', params.id).firstOrFail()

      tournament.isValidated = true
      await tournament.save()

      return response.json({
        success: true,
        message: 'Le tournoi a été validé avec succès',
      })
    } catch (error) {
      console.error('An error occurred while validating the tournament:', error)
      return response.status(500).json({
        error: true,
        message: 'An error occurred while validating the tournament',
      })
    }
  }

  public async refuseTournament({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== UserRole.Admin) {
      return response.status(401).json({
        error: true,
        message: 'Unauthorized access',
      })
    }

    try {
      const tournament = await getAllTournamentsWithoutImages()
        .where('id', params.id)
        .preload('teams', (teamsQuery) => {
          teamsQuery.preload('players')
        })
        .first()

      if (!tournament) {
        return response.status(404).json({
          error: true,
          message: 'Tournament not found',
        })
      }

      // Vérifier si les équipes ont des joueurs
      const hasTeamsWithPlayers = tournament.teams.some(
        (team) => team.players && team.players.length > 0
      )

      if (hasTeamsWithPlayers) {
        return response.status(400).json({
          error: true,
          message: 'This tournament has teams with players and cannot be refused.',
        })
      }

      // Suppression des équipes vides associées au tournoi
      if (tournament.teams && tournament.teams.length > 0) {
        await tournament.related('teams').query().delete()
      }

      // Supprimer le tournoi
      await tournament.delete()

      return response.json({
        success: true,
        message: 'Tournament refused successfully',
      })
    } catch (error) {
      console.error('An error occurred while refusing the tournament:', error)
      return response.status(500).json({
        error: true,
        message: 'An error occurred while refusing the tournament',
      })
    }
  }

  public async updateUserRole({ params, request, auth, response }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser || currentUser.role !== UserRole.Admin) {
      return response.unauthorized({ error: 'Unauthorized access' })
    }

    const user = await User.findOrFail(params.id)
    const newRole = request.input('role')

    if (!Object.values(UserRole).includes(newRole)) {
      return response.badRequest({ error: 'Invalid role' })
    }

    user.role = newRole
    await user.save()

    return response.ok({ success: true, message: 'User role updated successfully' })
  }

  public async banUser({ params, auth, response }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser || currentUser.role !== UserRole.Admin) {
      return response.unauthorized({ error: 'Unauthorized access' })
    }

    const user = await User.findOrFail(params.id)

    // Vérifier si l'utilisateur à bannir est un administrateur
    if (user.role === UserRole.Admin) {
      return response.forbidden({
        error: true,
        message: 'Les administrateurs ne peuvent pas être bannis',
      })
    }

    user.role = UserRole.Banned
    await user.save()

    return response.ok({ success: true, message: 'User banned successfully' })
  }

  public async unbanUser({ params, auth, response }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser || currentUser.role !== UserRole.Admin) {
      return response.unauthorized({ error: 'Unauthorized access' })
    }

    const user = await User.findOrFail(params.id)

    // Par défaut, on met l'utilisateur débanni en tant que User standard
    user.role = UserRole.User
    await user.save()

    return response.ok({ success: true, message: 'User unbanned successfully' })
  }

  public async deleteAccount({ auth, response, session }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ error: 'Unauthorized access' })
    }

    try {
      // Récupération des tournois créés par l'utilisateur
      const createdTournaments = await Tournament.query().where('creatorId', user.id)

      // Suppression des tournois créés par l'utilisateur
      for (const tournament of createdTournaments) {
        await TournamentService.deleteTournamentById(tournament.id, user)
      }

      await user.load('teams')

      // Retirer l'utilisateur de toutes ses équipes
      for (const team of user.teams) {
        await team.related('players').detach([user.id])
      }

      await user.related('favoriteGames').detach()

      // Déconnecter l'utilisateur avant suppression
      await auth.use().logout()
      session.forget('auth_user')

      await user.delete()

      return response.redirect().toPath('/')
    } catch (error) {
      console.error('Error during account deletion:', error)
      return response.status(500).json({
        error: true,
        message: 'Une erreur est survenue lors de la suppression du compte',
      })
    }
  }

  public async viewProfile({ params, inertia, auth, response }: HttpContext) {
    const pseudo = params.pseudo
    const currentUser = auth.user

    const targetUser = await User.query().where('pseudo', pseudo).first()

    if (!targetUser) {
      return inertia.render('errors/404')
    }

    // Vérifier si le profil est privé et si l'utilisateur n'est pas le propriétaire
    if (targetUser.isPrivate && (!currentUser || currentUser.id !== targetUser.id)) {
      return inertia.render('profile/index', {
        user: currentUser,
        targetUser: targetUser,
        isOwnProfile: currentUser?.id === targetUser.id,
        isAdminViewing: currentUser?.role === UserRole.Admin,
        tournaments: [],
        favoriteGames: [],
        createdTournaments: [],
        finishedTournaments: [],
        gameStats: {},
        games: [],
        pendingTournaments: [],
        allUsers: [],
      })
    }

    let tournaments: Tournament[] = []
    let favoriteGames: Game[] = []
    let createdTournaments: Tournament[] = []
    let finishedTournaments: Tournament[] = []
    let gameStats: Record<string, GameStatistic> = {}
    let games: Game[] = []

    // Récupérer tous les jeux disponibles
    games = await getAllGamesWithoutImages().orderBy('name', 'asc')

    // Charger les équipes de l'utilisateur cible
    await targetUser.load('teams')
    await targetUser.load('favoriteGames')

    // Utiliser le service pour récupérer les tournois
    const userTournaments = await TournamentService.getUserTournaments(targetUser)
    tournaments = userTournaments.activeTournaments
    finishedTournaments = userTournaments.finishedTournaments
    const allUserTournaments = userTournaments.allTournaments

    // Calculer les statistiques par jeu en utilisant le service
    try {
      gameStats = TournamentService.calculateGameStatistics(allUserTournaments, targetUser.id)
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: 'An error occurred while calculating game statistics',
      })
    }

    // Récupération des jeux favoris de l'utilisateur
    favoriteGames = targetUser.favoriteGames.slice().sort((a, b) => a.name.localeCompare(b.name))

    // Récupération des tournois créés par l'utilisateur
    createdTournaments = await getAllTournamentsWithoutImages()
      .where('creatorId', targetUser.id)
      .where('isValidated', true)
      .preload('game', (gameQuery) => {
        gameQuery.select('id', 'name', 'platform')
      })
      .orderBy('created_at', 'desc')

    return inertia.render('profile/index', {
      user: currentUser,
      targetUser: targetUser,
      isOwnProfile: currentUser?.id === targetUser.id,
      isAdminViewing: currentUser?.role === UserRole.Admin,
      tournaments: tournaments,
      favoriteGames: favoriteGames,
      createdTournaments: createdTournaments,
      finishedTournaments: finishedTournaments,
      gameStats: gameStats,
      games: games,
      pendingTournaments: [],
      allUsers: [],
    })
  }
}
