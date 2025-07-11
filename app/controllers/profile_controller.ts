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

      return inertia.render('profile/index', {
        user: user,
        tournaments: tournaments,
        favoriteGames: favoriteGames,
        pendingTournaments: pendingTournaments,
      })
    }

    return inertia.render('profile/index', {
      user: user,
      tournaments: tournaments,
      favoriteGames: favoriteGames,
      pendingTournaments: [],
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
      return response.unauthorized('Unauthorized access')
    }

    const tournament = await Tournament.find(params.id)
    if (tournament) {
      tournament.isValidated = true
      await tournament.save()
    }

    return response.redirect().back()
  }

  public async refuseTournament({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.role !== UserRole.Admin) {
      return response.unauthorized('Unauthorized access')
    }

    const tournament = await Tournament.find(params.id)
    if (tournament) {
      await tournament.delete()
    }

    return response.redirect().back()
  }
}
