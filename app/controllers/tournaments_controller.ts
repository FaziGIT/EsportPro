import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import Team from '#models/team'
import Match from '#models/match'

export default class TournamentsController {
  public async index({ inertia }: HttpContext) {
    const tournaments = await Tournament.query().orderBy('start_date', 'asc')

    return inertia.render('tournaments/index', {
      tournaments,
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

  public async show({ params, inertia }: HttpContext) {
    if (!params.id) {
      throw new Error('Tournament ID is required')
    }

    const tournament = await Tournament.query().where('id', params.id).firstOrFail()
    const teams = await Team.query().where('tournament_id', params.id).preload('players')
    const matches = await Match.query()
      .where('tournament_id', params.id)
      .preload('team1')
      .preload('team2')
      .preload('winner')
      .orderBy('created_at', 'asc')

    return inertia.render('tournaments/show', { tournament, teams, matches })
  }

  public async join({ params, auth, response }: HttpContext) {
    if (!params.id) {
      throw new Error('Tournament ID is required')
    }

    const user = auth.user!
    const tournament = await Tournament.query().where('id', params.id).firstOrFail()

    // Check if tournament has started
    let startDate: Date
    if (tournament.startDate instanceof Date) {
      startDate = tournament.startDate
    } else if (typeof tournament.startDate === 'string') {
      startDate = new Date(tournament.startDate)
    } else {
      // Assume it's a Luxon DateTime
      startDate = tournament.startDate.toJSDate()
    }

    if (new Date() >= startDate) {
      return response.badRequest({ error: 'Tournament has already started' })
    }

    // Check if user is already in a team for this tournament
    const existingTeam = await Team.query()
      .where('tournament_id', params.id)
      .whereHas('players', (query) => {
        query.where('user_id', user.id)
      })
      .first()

    if (existingTeam) {
      return response.badRequest({ error: 'You are already registered for this tournament' })
    }

    // Get all teams for this tournament with their player count, sorted by creation
    const teams = await Team.query()
      .where('tournament_id', params.id)
      .preload('players')
      .orderBy('created_at', 'asc')

    // Find the first team with available slots
    let team = teams.find((t) => t.players.length < tournament.numberPlayersPerTeam)

    if (!team) {
      // Create a new team (no plus de logique de nom, juste une nouvelle équipe)
      team = await Team.create({
        name: `Team ${teams.length + 1}`,
        tournamentId: params.id,
        isWinner: false,
      })
    }

    // Add user to the team
    await team.related('players').attach([user.id])

    // Return updated data for dynamic refresh
    const updatedTeams = await Team.query().where('tournament_id', params.id).preload('players')

    const matches = await Match.query()
      .where('tournament_id', params.id)
      .preload('team1')
      .preload('team2')
      .preload('winner')
      .orderBy('created_at', 'asc')

    // Return JSON response with updated data
    return response.json({
      success: true,
      teams: updatedTeams,
      matches: matches,
      userTeam: team,
    })
  }

  public async updateTeam({ params, auth, request, response, inertia }: HttpContext) {
    if (!params.id) {
      throw new Error('Team ID is required')
    }

    const user = auth.user!
    const team = await Team.query().where('id', params.id).firstOrFail()

    // Check if user is in this team
    const isUserInTeam = await team.related('players').query().where('user_id', user.id).first()
    if (!isUserInTeam) {
      return response.forbidden({ error: 'You can only update your own team' })
    }

    const { name } = request.only(['name'])
    if (!name || name.trim().length === 0) {
      return response.badRequest({ error: 'Team name cannot be empty' })
    }

    // Update team name
    await team.merge({ name: name.trim() }).save()

    // Return success response
    return response.json({
      success: true,
      team: team,
    })
  }
}
