import Match from '#models/match'
import Channel from '#models/channel'
import { UserRole } from '#enums/user_role'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import User from '#models/user'
import Tournament from '#models/tournament'
import { DateTime, Duration } from 'luxon'
import { GameStatistic } from '#types/game_statistics'

export default class TournamentService {
  static async deleteTournamentById(tournamentId: string, currentUser: User) {
    const tournament = await getAllTournamentsWithoutImages()
      .where('id', tournamentId)
      .preload('teams', (teamsQuery) => teamsQuery.preload('players'))
      .firstOrFail()

    const isAdmin = currentUser?.role === UserRole.Admin
    const isCreator = tournament.creatorId === currentUser?.id

    if (!isAdmin && !isCreator) {
      throw new Error('Unauthorized')
    }

    for (const team of tournament.teams) {
      if (team.players?.length) {
        const playerIds = team.players.map((p) => p.id)
        await team.related('players').detach(playerIds)
      }
    }

    await tournament.related('teams').query().delete()
    await Match.query().where('tournament_id', tournament.id).delete()
    await Channel.query().where('tournament_id', tournament.id).delete()

    await tournament.delete()
  }

  static async getUserTournaments(user: User) {
    const tournamentIds = user.teams.map((team) => team.tournamentId).filter((id) => id !== null)

    let allUserTournaments: Tournament[] = []
    let finishedTournaments: Tournament[] = []
    let activeTournaments: Tournament[] = []

    if (tournamentIds.length > 0) {
      allUserTournaments = await getAllTournamentsWithoutImages()
        .whereIn('id', tournamentIds)
        .preload('game', (gameQuery) => {
          gameQuery.select('id', 'name', 'platform')
        })
        .preload('teams', (teamsQuery) => {
          teamsQuery.preload('players')
        })

      finishedTournaments = allUserTournaments.filter((tournament) => {
        const isEnded = tournament.endDate < DateTime.now()
        const hasWinner = !!tournament.winnerId
        return isEnded || hasWinner
      })

      // Les tournois en cours sont ceux qui ne sont pas terminés
      activeTournaments = allUserTournaments
        .filter((tournament) => !finishedTournaments.includes(tournament))
        .sort((a, b) => a.endDate.valueOf() - b.endDate.valueOf())
    }

    return {
      allTournaments: allUserTournaments,
      finishedTournaments,
      activeTournaments,
    }
  }

  static calculateGameStatistics(
    tournaments: Tournament[],
    userId: string
  ): Record<string, GameStatistic> {
    const gameStatsMap: Record<string, GameStatistic> = {}

    tournaments.forEach((tournament) => {
      if (!tournament.game) return

      const gameId = tournament.game.id
      if (!gameStatsMap[gameId]) {
        gameStatsMap[gameId] = {
          totalMatches: 0,
          wins: 0,
          totalMillis: 0,
          gameName: tournament.game.name,
        }
      }

      // Incrémenter le nombre de matchs
      gameStatsMap[gameId].totalMatches++

      // Vérifier si l'utilisateur a gagné ce tournoi
      if (tournament.winnerId) {
        const userTeam = tournament.teams?.find((team) =>
          team.players?.some((player) => player?.id === userId)
        )

        // Si l'équipe de l'utilisateur est l'équipe gagnante
        if (userTeam && tournament.winnerId === userTeam.id) {
          gameStatsMap[gameId].wins++
        }
      }

      // Calculer le temps de jeu uniquement pour les tournois terminés
      try {
        const isEnded = tournament.endDate < DateTime.now()
        const hasWinner = !!tournament.winnerId

        if (isEnded && hasWinner && tournament.startDate && tournament.endDate) {
          const durationInMillis = Duration.fromMillis(
            tournament.endDate.valueOf() - tournament.startDate.valueOf()
          )
          if (durationInMillis.valueOf() > 0) {
            gameStatsMap[gameId].totalMillis += durationInMillis.valueOf()
          }
        }
      } catch (error) {
        console.error('Error calculating game statistics:', error)
      }
    })

    return gameStatsMap
  }
}
