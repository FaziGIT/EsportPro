import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { GameFactory } from '#database/factories/game_factory'
import { UserFactory } from '#database/factories/user_factory'
import { TournamentFactory } from '#database/factories/tournament_factory'
import { TeamFactory } from '#database/factories/team_factory'
import { ChannelFactory } from '#database/factories/channel_factory'
import { createTournamentBracket } from '#database/factories/match_factory'
import Tournament from '#models/tournament'
import { ChatMessageFactory } from '#database/factories/chat_message_factory'

export default class extends BaseSeeder {
  async run() {
    // Create games first
    await GameFactory.createMany(10)

    // Create users with realistic data
    await UserFactory.createMany(20)

    // Create users with game info
    await UserFactory.with('gameInfos', 3, (builder) =>
      builder.pivotAttributes([
        { elo: '1000', pseudo: 'ProPlayer1', region: 'EU' },
        { elo: '2000', pseudo: 'EliteGamer', region: 'NA' },
        { elo: '3000', pseudo: 'Champion', region: 'ASIA' },
      ])
    ).createMany(10)

    await UserFactory.with('gameInfos', 3, (builder) =>
      builder.pivotAttributes([
        { elo: '1500', pseudo: 'GamingPro', region: 'EU' },
        { elo: '2500', pseudo: 'EsportStar', region: 'NA' },
        { elo: '3500', pseudo: 'Legend', region: 'ASIA' },
      ])
    )
      .with('favoriteGames', 3)
      .createMany(10)

    // Create tournaments
    await TournamentFactory.createMany(20)

    // Create teams and brackets for each tournament
    const tournaments = await Tournament.all()

    for (const tournament of tournaments) {
      // Create required number of teams for each tournament
      const requiredTeams = tournament.numberParticipants
      await TeamFactory.merge({ tournamentId: tournament.id }).createMany(requiredTeams)

      // Create bracket for this tournament
      await createTournamentBracket(tournament.id)
    }

    // Create chat channels and messages
    await ChannelFactory.createMany(5)
    await ChatMessageFactory.createMany(30)
  }
}
