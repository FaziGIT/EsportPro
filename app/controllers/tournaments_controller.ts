import type { HttpContext } from '@adonisjs/core/http'
import Tournament from '#models/tournament'
import Game from '#models/game'
import { tournamentValidator } from '#validators/tournament'
import { BufferToUint8Array, Uint8ArrayToBuffer } from '#services/transform_image.ts'
import { DateTime } from 'luxon'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import Team from '#models/team'
import Match from '#models/match'
import Channel from '#models/channel'
import { ChannelEntityType } from '#enums/channel_entity_type'
import { getAllGamesWithoutImages } from '../repository/game.js'
import path from 'node:path'
import { UserRole } from '#enums/user_role'
import TournamentService from '#services/tournament_service'

// To get the imageNotFound path in the server
const imageNotFound = path.join(process.cwd(), 'inertia', 'img', 'Image-not-found.png')

export default class TournamentsController {
  private async processTournamentData(
    data: any,
    auth: HttpContext['auth']
  ): Promise<Partial<Tournament>> {
    const tournamentData: Partial<Tournament> = {
      name: data.name,
      tier: data.tier,
      format: data.format,
      price: data.price,
      rules: data.rules,
      numberParticipants: data.numberParticipants,
      startDate: DateTime.fromJSDate(data.startDate),
      endDate: DateTime.fromJSDate(data.endDate),
      gameId: data.gameId,
      numberPlayersPerTeam: data.numberPlayersPerTeam,
      creatorId: auth.user?.id || null,
      isStarted: false,
    }

    // Handle online/offline mode
    if (data.isOnline) {
      tournamentData.region = null
      tournamentData.address = null
      tournamentData.city = null
      tournamentData.country = null
      tournamentData.postalCode = null
    } else {
      tournamentData.region = data.region!
      tournamentData.address = data.address!
      tournamentData.city = data.city!
      tournamentData.country = data.country!
      tournamentData.postalCode = data.postalCode!
    }

    // Handle image upload
    if (data.image) {
      tournamentData.image = BufferToUint8Array(data.image.tmpPath!)
    } else {
      tournamentData.image = BufferToUint8Array(imageNotFound)
    }

    return tournamentData
  }

  public async index({ inertia }: HttpContext) {
    // Fetch all games to display in the dropdown when creating new tournament
    const games = await getAllGamesWithoutImages().orderBy('name', 'asc')

    return inertia.render('tournaments/index', {
      games,
    })
  }

  public async api({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sort = request.input('sort', 'closest')

    const baseQuery = getAllTournamentsWithoutImages().where('is_validated', true)

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

  public async store({ request, i18n, response, auth }: HttpContext) {
    const data = await request.validateUsing(tournamentValidator, {
      messagesProvider: i18n.createMessagesProvider(),
    })

    try {
      const tournamentModel: Partial<Tournament> = await this.processTournamentData(data, auth)

      const tournament = await Tournament.create(tournamentModel)

      // Associate with game
      const game = await Game.find(data.gameId)
      await tournament.related('game').associate(game!)

      // Calculate the number of teams needed and create them
      let numberOfTeams: number
      let playersPerTeam: number

      if (data.teamMode && data.numberPlayersPerTeam) {
        // Team-based tournament: create teams with multiple players
        playersPerTeam = data.numberPlayersPerTeam
        numberOfTeams = Math.ceil(data.numberParticipants / playersPerTeam)
      } else {
        // Individual tournament: create "teams" with 1 player each
        playersPerTeam = 1
        numberOfTeams = data.numberParticipants
      }

      // Create all teams for the tournament
      const teamsToCreate = []
      for (let i = 1; i <= numberOfTeams; i++) {
        teamsToCreate.push({
          name: `Team ${i}`,
          tournamentId: tournament.id,
          isWinner: false,
        })
      }

      await Team.createMany(teamsToCreate)

      if (request.accepts(['html', 'json']) === 'json') {
        return response.json({
          success: true,
          message: 'Tournament created successfully and pending validation',
        })
      }
      return response.redirect().back()
    } catch (error) {
      console.error('Error creating tournament:', error)
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(500).json({
          error: true,
          message: 'An error occurred while creating the tournament',
        })
      }

      return response.status(500).json({
        error: true,
        message: 'An error occurred while creating the tournament',
      })
    }
  }

  public async launch({ params, auth, response }: HttpContext) {
    if (!params.id) {
      throw new Error('Tournament ID is required')
    }

    const user = auth.user!
    const tournament = await Tournament.query()
      .where('id', params.id)
      .preload('creator')
      .firstOrFail()

    // Check permissions: only admin or creator can start tournament
    const isAdmin = user.role === UserRole.Admin
    const isCreator = tournament.creatorId === user.id
    if (!isAdmin && !isCreator) {
      return response.forbidden({
        error: 'Only admin or tournament creator can start the tournament',
      })
    }

    // Check if tournament can be started
    if (tournament.isStarted) {
      return response.badRequest({ error: 'Tournament has already been started' })
    }

    // Check if it's time to start (current date >= start date)
    const now = DateTime.now()
    if (now < tournament.startDate) {
      return response.badRequest({ error: 'Tournament cannot be started before the start date' })
    }

    // Get all teams with players
    const allTeams = await Team.query().where('tournament_id', params.id).preload('players')
    const teamsWithPlayers = allTeams.filter((team) => team.players && team.players.length > 0)

    if (teamsWithPlayers.length < 2) {
      return response.badRequest({
        error: 'At least 2 teams with players are required to start the tournament',
      })
    }

    // Generate complete tournament bracket
    const { allMatches, roundMatches, nextMatchMapping } = this.generateAllTournamentMatches(
      teamsWithPlayers,
      tournament.id,
      tournament.format
    )

    // Create all matches in database
    const createdMatches = await Match.createMany(allMatches)

    // Now update nextMatchId fields with actual database IDs
    await this.linkMatchesWithNextMatchId(createdMatches, roundMatches, nextMatchMapping)

    // Mark tournament as started
    tournament.isStarted = true
    await tournament.save()

    // Return success response with updated data
    const updatedMatches = await Match.query()
      .where('tournament_id', params.id)
      .preload('team1')
      .preload('team2')
      .preload('winner')
      .orderBy('created_at', 'asc')

    return response.json({
      success: true,
      tournament: tournament,
      matches: updatedMatches,
      message: 'Tournament started successfully!',
    })
  }

  private generateAllTournamentMatches(
    teams: any[],
    tournamentId: string,
    tournamentFormat: string
  ): { allMatches: any[]; roundMatches: any[][]; nextMatchMapping: any[] } {
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5) // Shuffle teams for fairness

    // Calculate max score based on BO format
    const getMaxScore = (format: string): number => {
      switch (format) {
        case 'BO1':
          return 1
        case 'BO3':
          return 2 // First to 2 wins
        case 'BO5':
          return 3 // First to 3 wins
        default:
          return 1
      }
    }

    const maxScore = getMaxScore(tournamentFormat)

    // Calculate bracket size (next power of 2)
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(shuffledTeams.length)))
    const totalRounds = Math.log2(nextPowerOf2)

    // Generate all matches for the entire bracket
    const allMatches: any[] = []
    const roundMatches: any[][] = []
    const nextMatchMapping: any[] = [] // Separate tracking for next match relationships

    // Create matches for each round (bottom-up approach)
    for (let round = 0; round < totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round - 1)
      const matches = []

      for (let i = 0; i < matchesInRound; i++) {
        const match = {
          tournamentId,
          scoreTeam1: 0,
          scoreTeam2: 0,
          winnerId: null,
          nextMatchId: null,
          team1Id: null,
          team2Id: null,
        }

        // For first round, assign actual teams
        if (round === 0) {
          const team1 = shuffledTeams[i * 2] || null
          const team2 = shuffledTeams[i * 2 + 1] || null

          if (team1) {
            match.team1Id = team1.id
          }
          if (team2) {
            match.team2Id = team2.id
          }

          // Handle bye matches (team1 vs no one)
          if (team1 && !team2) {
            match.scoreTeam1 = maxScore
            match.winnerId = team1.id
          }
        }

        matches.push(match)
      }

      roundMatches.push(matches)
      allMatches.push(...matches)
    }

    // Create next match mapping separately (don't add to match objects)
    let matchIndex = 0
    for (let round = 0; round < totalRounds - 1; round++) {
      const currentRound = roundMatches[round]

      for (let i = 0; i < currentRound.length; i++) {
        const nextMatchIndex = Math.floor(i / 2)

        // Store mapping separately from match data
        nextMatchMapping.push({
          currentMatchIndex: matchIndex,
          nextMatchInfo: {
            round: round + 1,
            index: nextMatchIndex,
          },
        })

        matchIndex++
      }
    }

    // Add remaining matches that don't have next matches (final match)
    for (let round = totalRounds - 1; round < totalRounds; round++) {
      matchIndex += roundMatches[round].length
    }

    return { allMatches, roundMatches, nextMatchMapping }
  }

  private async linkMatchesWithNextMatchId(
    createdMatches: Match[],
    roundMatches: any[][],
    nextMatchMapping: any[]
  ): Promise<void> {
    for (const mapping of nextMatchMapping) {
      const currentMatch = createdMatches[mapping.currentMatchIndex]
      const nextMatchGlobalIndex = this.getGlobalMatchIndex(
        mapping.nextMatchInfo.round,
        mapping.nextMatchInfo.index,
        roundMatches
      )
      const nextMatch = createdMatches[nextMatchGlobalIndex]

      await currentMatch.merge({ nextMatchId: nextMatch.id }).save()
    }
  }

  private getGlobalMatchIndex(
    targetRound: number,
    targetIndex: number,
    roundMatches: any[][]
  ): number {
    let globalIndex = 0

    for (let round = 0; round < targetRound; round++) {
      globalIndex += roundMatches[round].length
    }

    return globalIndex + targetIndex
  }

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

  public async show({ params, inertia, response }: HttpContext) {
    if (!params.id) {
      throw new Error('Tournament ID is required')
    }

    // First get the tournament
    const tournament = await getAllTournamentsWithoutImages()
      .preload('game', (query) => {
        query.select('id', 'name')
      })
      .where('id', params.id)
      .firstOrFail()

    if (!tournament.isValidated) {
      return response.redirect().back()
    }

    // Load creator if creatorId exists
    if (tournament.creatorId) {
      await tournament.load('creator')
    }

    const teams = await Team.query().where('tournament_id', params.id).preload('players')
    const matches = await Match.query()
      .where('tournament_id', params.id)
      .preload('team1')
      .preload('team2')
      .preload('winner')
      .orderBy('created_at', 'asc')

    // Fetch all games to display in the dropdown for editing
    const games = await getAllGamesWithoutImages().orderBy('name', 'asc')

    return inertia.render('tournaments/show', { tournament, teams, matches, games })
  }

  public async join({ params, auth, response }: HttpContext) {
    if (!params.id) {
      throw new Error('Tournament ID is required')
    }

    const user = auth.user!
    const tournament = await Tournament.query().where('id', params.id).firstOrFail()

    // Check if tournament has started
    const startDate = tournament.startDate

    if (DateTime.now() >= startDate) {
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
    const team = teams.find((t) => t.players.length < tournament.numberPlayersPerTeam)

    if (!team) {
      return response.badRequest({ error: 'No available teams with open slots' })
    }

    // Add user to the team
    await team.related('players').attach([user.id])

    if (tournament.numberPlayersPerTeam > 1) {
      // Create a channel for the team if don't exist
      let channelTeam = await Channel.query().where('team_id', team.id).first()
      if (!channelTeam) {
        channelTeam = await Channel.create({
          name: `${tournament.name} - ${team.name}`,
          entityType: ChannelEntityType.Team,
          teamId: team.id,
          tournamentId: null,
        })

        // Add the team to the channel
        await channelTeam.related('team').associate(team)
        await channelTeam.save()
      }

      // Create a channel for the tournament if don't exist, and add the tournament to the channel
      let channelTournament = await Channel.query().where('tournament_id', params.id).first()
      if (!channelTournament) {
        channelTournament = await Channel.create({
          name: tournament.name,
          entityType: ChannelEntityType.Tournament,
          tournamentId: tournament.id,
          teamId: null,
        })

        // Add the tournament to the channel
        await channelTournament.related('tournament').associate(tournament)
        await channelTournament.save()
      }
    }

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

  public async leave({ params, auth, response }: HttpContext) {
    if (!params.id) {
      throw new Error('Tournament ID is required')
    }

    const user = auth.user!
    const tournament = await Tournament.query().where('id', params.id).firstOrFail()

    // Check if tournament has started
    if (tournament.isStarted) {
      return response.badRequest({ error: 'Cannot leave tournament after it has started' })
    }

    // Find the team the user is in for this tournament
    const userTeam = await Team.query()
      .where('tournament_id', params.id)
      .whereHas('players', (query) => {
        query.where('user_id', user.id)
      })
      .preload('players')
      .first()

    if (!userTeam) {
      return response.badRequest({ error: 'You are not registered for this tournament' })
    }

    // Remove user from the team
    await userTeam.related('players').detach([user.id])

    // Reload players to get updated count
    await userTeam.load('players')

    // If team becomes empty, reset the team name to default
    if (userTeam.players.length === 0) {
      // Get all teams for this tournament to determine the team number
      const allTeams = await Team.query()
        .where('tournament_id', params.id)
        .orderBy('created_at', 'asc')

      // Find the position of this team to generate the default name
      const teamIndex = allTeams.findIndex((team) => team.id === userTeam.id)
      const defaultName = `Team ${teamIndex + 1}`

      await userTeam.merge({ name: defaultName }).save()

      // Delete the channel of the team
      await userTeam.related('channel').query().delete()
    }

    // Return updated data for dynamic refresh
    const updatedTeams = await Team.query().where('tournament_id', params.id).preload('players')

    const matches = await Match.query()
      .where('tournament_id', params.id)
      .preload('team1')
      .preload('team2')
      .preload('winner')
      .orderBy('created_at', 'asc')

    // If all the teams are empty, delete the channel of the tournament
    if (updatedTeams.every((team) => team.players.length === 0)) {
      await Channel.query().where('tournament_id', params.id).delete()
    }

    // Return JSON response with updated data
    return response.json({
      success: true,
      teams: updatedTeams,
      matches: matches,
      message: 'Successfully left the tournament',
    })
  }

  public async updateTeam({ params, auth, request, response }: HttpContext) {
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

  public async update({ params, request, i18n, response, auth }: HttpContext) {
    if (!params.id) {
      throw new Error('Tournament ID is required')
    }

    try {
      const tournament = await Tournament.findOrFail(params.id)
      const user = auth.user!

      // Vérifier si l'utilisateur est autorisé à modifier le tournoi
      const isAdmin = user.role === UserRole.Admin
      const isCreator = tournament.creatorId === user.id

      if (!isAdmin && !isCreator) {
        return response.status(403).json({
          error: true,
          message: 'You are not authorized to update this tournament',
        })
      }

      const data = await request.validateUsing(tournamentValidator, {
        messagesProvider: i18n.createMessagesProvider(),
      })

      const updateData: Partial<Tournament> = await this.processTournamentData(data, auth)

      // Update the tournament
      await tournament.merge(updateData).save()

      // Update game association if changed
      if (data.gameId !== tournament.gameId) {
        const game = await Game.find(data.gameId)
        if (game) {
          await tournament.related('game').associate(game)
        }
      }

      if (request.accepts(['html', 'json']) === 'json') {
        return response.json({
          success: true,
          message: 'Tournament updated successfully',
        })
      }

      return response.redirect().back()
    } catch (error) {
      console.error('Error updating tournament:', error)

      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(500).json({
          error: true,
          message: 'An error occurred while updating the tournament',
          details: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      return response.status(500).json({
        error: true,
        message: 'An error occurred while updating the tournament',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  public async updateMatchScore({ params, auth, request, response }: HttpContext) {
    if (!params.id || !params.matchId) {
      throw new Error('Tournament ID and Match ID are required')
    }

    const user = auth.user!
    const { scoreTeam1, scoreTeam2 } = request.only(['scoreTeam1', 'scoreTeam2'])

    // Get tournament and match
    const tournament = await Tournament.query()
      .where('id', params.id)
      .preload('creator')
      .firstOrFail()

    const match = await Match.query()
      .where('id', params.matchId)
      .where('tournament_id', params.id)
      .preload('team1')
      .preload('team2')
      .firstOrFail()

    // Check permissions: only admin or tournament creator can update scores
    const isAdmin = user.role === UserRole.Admin
    const isCreator = tournament.creatorId === user.id
    if (!isAdmin && !isCreator) {
      return response.forbidden({
        error: 'Only admin or tournament creator can update match scores',
      })
    }

    // Validate tournament has started
    if (!tournament.isStarted) {
      return response.badRequest({ error: 'Tournament must be started to update scores' })
    }

    // Validate scores
    if (typeof scoreTeam1 !== 'number' || typeof scoreTeam2 !== 'number') {
      return response.badRequest({ error: 'Invalid score values' })
    }

    if (scoreTeam1 < 0 || scoreTeam2 < 0) {
      return response.badRequest({ error: 'Scores cannot be negative' })
    }

    // Calculate max score based on tournament format
    const getMaxScore = (format: string): number => {
      switch (format) {
        case 'BO1':
          return 1
        case 'BO3':
          return 2
        case 'BO5':
          return 3
        default:
          return 1
      }
    }

    const maxScore = getMaxScore(tournament.format)

    if (scoreTeam1 > maxScore || scoreTeam2 > maxScore) {
      return response.badRequest({
        error: `Scores cannot exceed ${maxScore} for ${tournament.format} format`,
      })
    }

    // Determine winner
    let winnerId: string | null = null
    if (scoreTeam1 === maxScore && scoreTeam2 < maxScore) {
      winnerId = match.team1Id
    } else if (scoreTeam2 === maxScore && scoreTeam1 < maxScore) {
      winnerId = match.team2Id || null // Handle bye case
    } else if (scoreTeam1 !== maxScore && scoreTeam2 !== maxScore) {
      // Neither team has reached max score yet
      winnerId = null
    } else {
      return response.badRequest({ error: 'Invalid score combination' })
    }

    // Update match
    await match
      .merge({
        scoreTeam1,
        scoreTeam2,
        winnerId,
      })
      .save()

    // If match has a winner, advance them to the next match
    if (winnerId) {
      await this.advanceWinnerToNextMatch(match, winnerId, tournament.format)
    }

    // Return updated matches and tournament data like join tournament does
    const updatedMatches = await Match.query()
      .where('tournament_id', params.id)
      .preload('team1')
      .preload('team2')
      .preload('winner')
      .orderBy('created_at', 'asc')

    const updatedTournament = await Tournament.query()
      .where('id', params.id)
      .preload('creator')
      .firstOrFail()

    return response.json({
      success: true,
      matches: updatedMatches,
      tournament: updatedTournament,
    })
  }

  private async advanceWinnerToNextMatch(match: Match, winnerId: string, tournamentFormat: string) {
    if (!match.nextMatchId) {
      // This is the final match, update tournament winner
      await Tournament.query().where('id', match.tournamentId).update({ winnerId })
      return
    }

    // Get the next match
    const nextMatch = await Match.query().where('id', match.nextMatchId).first()

    if (!nextMatch) return

    // Advance winner to next match
    if (!nextMatch.team1Id) {
      // First team slot is empty, place winner there
      await nextMatch.merge({ team1Id: winnerId }).save()
    } else if (!nextMatch.team2Id) {
      // Second team slot is empty, place winner there
      await nextMatch.merge({ team2Id: winnerId }).save()

      // Now both teams are set, check if it's a bye situation
      await this.handlePotentialBye(nextMatch, tournamentFormat)
    }
  }

  private async handlePotentialBye(match: Match, tournamentFormat: string) {
    // If only one team in the match (bye situation), auto-advance them
    if ((match.team1Id && match.team2Id === null) || (match.team1Id === null && match.team2Id)) {
      const winnerId = match.team1Id || match.team2Id!

      const getMaxScore = (format: string): number => {
        switch (format) {
          case 'BO1':
            return 1
          case 'BO3':
            return 2
          case 'BO5':
            return 3
          default:
            return 1
        }
      }

      const maxScore = getMaxScore(tournamentFormat)

      await match
        .merge({
          scoreTeam1: match.team1Id ? maxScore : 0,
          scoreTeam2: match.team2Id ? maxScore : 0,
          winnerId,
        })
        .save()

      // Continue advancing if there's a next match
      await this.advanceWinnerToNextMatch(match, winnerId, tournamentFormat)
    }
  }

  public async deleteTournament({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.status(401).json({
        error: true,
        message: 'Unauthorized access',
      })
    }

    try {
      await TournamentService.deleteTournamentById(params.id, user)

      return response.json({
        success: true,
        message: 'Tournament successfully deleted',
      })
    } catch (error) {
      return response.status(500).json({
        error: true,
        message: 'An error occurred while deleting the tournament',
      })
    }
  }
}
