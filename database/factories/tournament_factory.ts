import factory from '@adonisjs/lucid/factories'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'
import Game from '#models/game'
import { FormatType } from '#enums/format_type'
import { TierType } from '#enums/tier_type'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const TournamentFactory = factory
  .define(Tournament, async ({ faker }) => {
    let imageBytes: Uint8Array
    try {
      const dirname = path.dirname(fileURLToPath(import.meta.url))
      const imagePath = path.resolve(dirname, '../../inertia/img/blackLogo.jpg')
      const imageBuffer = readFileSync(imagePath)
      imageBytes = new Uint8Array(imageBuffer)
    } catch (error) {
      console.warn("Impossible de charger l'image BlackLogo, utilisation de bytes aléatoires")
      imageBytes = new Uint8Array(16)
      for (let i = 0; i < imageBytes.length; i++) {
        imageBytes[i] = Math.floor(Math.random() * 256)
      }
    }

    const numberParticipants = faker.number.int({ min: 8, max: 64 })
    const price = faker.number.int({ min: 100, max: 10000 })
    const startDate = DateTime.fromJSDate(faker.date.future())
    const endDate = startDate.plus({ days: faker.number.int({ min: 1, max: 7 }) })
    const allGame = await Game.all()
    const randomGameId = faker.helpers.arrayElement(allGame).id

    return {
      name: faker.company.name().substring(0, 200) + ' Tournament',
      tier: faker.helpers.arrayElement(Object.values(TierType)),
      format: faker.helpers.arrayElement(Object.values(FormatType)),
      price,
      rules: faker.lorem.paragraph(2).substring(0, 250),
      numberParticipants,
      numberPlayersPerTeam: faker.number.int({ min: 1, max: 10 }),
      region: faker.location.country().substring(0, 50),
      address: faker.location.streetAddress().substring(0, 200),
      city: faker.location.city().substring(0, 100),
      country: faker.location.country().substring(0, 100),
      postalCode: faker.location.zipCode().substring(0, 20),
      image: imageBytes,
      startDate: startDate,
      endDate: endDate,
      isValidated: faker.helpers.arrayElement([true, false]),
      gameId: randomGameId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    }
  })
  .build()
