import factory from '@adonisjs/lucid/factories'
import Game from '#models/game'
import { DateTime } from 'luxon'
import { UserFactory } from '#database/factories/user_factory'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

export const GameFactory = factory
  .define(Game, async ({ faker }) => {
    const platforms = ['PC', 'PS4', 'PS5', 'XBOX', 'SWITCH']

    let imageBytes: Uint8Array
    try {
      const dirname = path.dirname(fileURLToPath(import.meta.url))
      const imagePath = path.resolve(dirname, '../../inertia/img/celeste.webp')
      const imageBuffer = readFileSync(imagePath)
      imageBytes = new Uint8Array(imageBuffer)
    } catch (error) {
      console.warn('Error loading image')
      imageBytes = new Uint8Array(16)
      for (let i = 0; i < imageBytes.length; i++) {
        imageBytes[i] = Math.floor(Math.random() * 256)
      }
    }

    return {
      name: faker.lorem.words(2),
      image: imageBytes,
      createdAt: DateTime.fromJSDate(faker.date.past()),
      updatedAt: DateTime.fromJSDate(faker.date.past()),
      platform: faker.helpers.arrayElement(platforms),
    }
  })
  .relation('users', () => UserFactory)
  .relation('favoriteOfUsers', () => UserFactory)
  .build()
