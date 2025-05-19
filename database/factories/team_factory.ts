import factory from '@adonisjs/lucid/factories'
import Team from '#models/team'
import Tournament from '#models/tournament'
import { UserFactory } from '#database/factories/user_factory'

export const TeamFactory = factory
  .define(Team, async ({ faker }) => {
    const allTournaments = await Tournament.all()

    const randomTournamentId = faker.helpers.arrayElement(allTournaments).id

    return {
      name: faker.lorem.words(1),
      isWinner: faker.helpers.arrayElement([true, false]),
      tournamentId: randomTournamentId,
    }
  })
  .relation('players', () => UserFactory)
  .build()
