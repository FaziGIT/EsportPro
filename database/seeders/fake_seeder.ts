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
    await GameFactory.createMany(10)

    // Create 3 UserFactory, one with 3 gameInfos and 3 favoriteGames, one with 3 gameInfos only and one with 3 favoriteGames
    await UserFactory.createMany(10)
    await UserFactory.with('gameInfos', 3, (builder) =>
      builder.pivotAttributes([
        { elo: '1000', pseudo: 'test1', region: 'EU' },
        { elo: '2000', pseudo: 'test2', region: 'EU' },
        { elo: '3000', pseudo: 'test3', region: 'EU' },
      ])
    ).createMany(5)

    await UserFactory.with('gameInfos', 3, (builder) =>
      builder.pivotAttributes([
        { elo: '1000', pseudo: 'test1', region: 'EU' },
        { elo: '2000', pseudo: 'test2', region: 'EU' },
        { elo: '3000', pseudo: 'test3', region: 'EU' },
      ])
    )
      .with('favoriteGames', 3)
      .createMany(5)
    await UserFactory.with('favoriteGames', 3).createMany(5)

    await TournamentFactory.createMany(150)

    await TeamFactory.createMany(5)
    await TeamFactory.with('players', 5).createMany(5)

    await ChannelFactory.createMany(10)

    // Create a tree of tournaments
    const tournaments = await Tournament.query()
    for (const tournament of tournaments) {
      await createTournamentBracket(tournament.id)
    }

    await ChatMessageFactory.createMany(15)
  }
}
