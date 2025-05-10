import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { UserRole } from '#enums/user_role'
import { GameFactory } from '#database/factories/game_factory'
import { TeamFactory } from '#database/factories/team_factory'

export const UserFactory = factory
  .define(User, ({ faker }) => {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      pseudo: faker.internet.username(),
      email: faker.internet.email(),
      password: 'password',
      isPrivate: faker.datatype.boolean(),
      role: faker.helpers.arrayElement(Object.values(UserRole)),
    }
  })
  .relation('gameInfos', () => GameFactory)
  .relation('favoriteGames', () => GameFactory)
  .relation('teams', () => TeamFactory)
  .build()
