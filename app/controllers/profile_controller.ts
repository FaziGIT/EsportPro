import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'
import { UserRole } from '#enums/user_role'
import Game from '#models/game'

export default class ProfileController {
  public async index({ inertia, auth }: HttpContext) {
    const user = auth.user
    let tournaments: Tournament[] = []
    let favoriteGames: Game[] = []
    let pendingTournaments: Tournament[] = []
    let createdTournaments: Tournament[] = []

    if (user) {
      await user.load('teams', (query) => {
        query.preload('tournament')
      })
      await user.load('favoriteGames')

      // Récupération des tournois auxquels l'utilisateur participe
      tournaments = user.teams
        .map((team) => team.tournament)
        .filter((tournament) => tournament && tournament.endDate >= DateTime.now())
        .sort((a, b) => a.endDate.valueOf() - b.endDate.valueOf())

      // Récupération des jeux favoris de l'utilisateur
      favoriteGames = user.favoriteGames.slice().sort((a, b) => a.name.localeCompare(b.name))

      // Récupération des tournois en attente de validation pour les admins
      if (user.role === UserRole.Admin) {
        pendingTournaments = await Tournament.query()
          .where('isValidated', false)
          .preload('game')
          .orderBy('created_at', 'asc')
      }

      // Récupération des tournois créés par l'utilisateur
      createdTournaments = await Tournament.query()
        .where('creatorId', user.id)
        .preload('game')
        .orderBy('created_at', 'desc')

      return inertia.render('profile/index', {
        user: user,
        tournaments: tournaments,
        favoriteGames: favoriteGames,
        pendingTournaments: pendingTournaments,
        createdTournaments: createdTournaments,
      })
    }

    return inertia.render('profile/index', {
      user: user,
      tournaments: tournaments,
      favoriteGames: favoriteGames,
      pendingTournaments: [],
      createdTournaments: [],
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

  public async updateName({ request, auth, response }: HttpContext) {
    const user = auth.user
    const firstName = request.input('firstName')
    const lastName = request.input('lastName')

    if (user) {
      user.firstName = firstName
      user.lastName = lastName
      await user.save()
    }

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
      const tournament = await Tournament.find(params.id)
      if (!tournament) {
        return response.status(404).json({
          error: true,
          message: 'Tournament not found',
        })
      }

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
      const tournament = await Tournament.query()
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
}
