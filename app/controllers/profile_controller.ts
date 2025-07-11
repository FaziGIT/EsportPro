import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'

export default class ProfileController {
  public async index({ inertia, auth }: HttpContext) {
    const user = auth.user
    let tournaments: Tournament[] = []
    if (user) {
      await user.load('teams', (query) => {
        query.preload('tournament')
      })

      tournaments = user.teams
        .map((team) => team.tournament)
        .filter((tournament) => tournament && tournament.endDate >= DateTime.now())
        .sort((a, b) => a.endDate.valueOf() - b.endDate.valueOf())
    }
    return inertia.render('profile/index', {
      user: user,
      tournaments: tournaments,
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
}
