import Match from '#models/match'
import Channel from '#models/channel'
import { UserRole } from '#enums/user_role'
import { getAllTournamentsWithoutImages } from '../repository/tournament.js'
import User from '#models/user'

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
}
