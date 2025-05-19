import factory from '@adonisjs/lucid/factories'
import Game from '#models/game'
import { DateTime } from 'luxon'
import { UserFactory } from '#database/factories/user_factory'

export const GameFactory = factory
  .define(Game, async ({ faker }) => {
    const platforms = ['PC', 'PS4', 'PS5', 'XBOX', 'SWITCH']

    // Creating a random image with random bytes
    const randomBytes = new Uint8Array(16)
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }

    return {
      name: faker.lorem.words(2),
      image: randomBytes,
      createdAt: DateTime.fromJSDate(faker.date.past()),
      updatedAt: DateTime.fromJSDate(faker.date.past()),
      platform: faker.helpers.arrayElement(platforms),
    }
  })
  .relation('users', () => UserFactory)
  .relation('favoriteOfUsers', () => UserFactory)
  .build()
