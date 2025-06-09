import factory from '@adonisjs/lucid/factories'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'
import Game from '#models/game'
import { FormatType } from '#enums/format_type'

export const TournamentFactory = factory
  .define(Tournament, async ({ faker }) => {
    // Creating a random image with random bytes
    const randomBytes = new Uint8Array(16)
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }

    const tiers = ['S', 'A', 'B', 'C']

    const numberParticipants = faker.number.int({ min: 8, max: 64 })

    const price = faker.number.int({ min: 100, max: 10000 })

    const startDate = DateTime.fromJSDate(faker.date.future())
    const endDate = startDate.plus({ days: faker.number.int({ min: 1, max: 7 }) })

    const allGame = await Game.all()

    const randomGameId = faker.helpers.arrayElement(allGame).id

    return {
      name: faker.company.name().substring(0, 200) + ' Tournament',
      tier: faker.helpers.arrayElement(tiers),
      format: faker.helpers.arrayElement(Object.values(FormatType)),
      price,
      rules: faker.lorem.paragraph(2).substring(0, 250), // Limiter à 250 caractères
      numberParticipants,
      numberPlayersPerTeam: faker.number.int({ min: 1, max: 5 }),
      region: faker.location.country().substring(0, 100),
      address: faker.location.streetAddress().substring(0, 200),
      city: faker.location.city().substring(0, 100),
      country: faker.location.country().substring(0, 100),
      postalCode: faker.location.zipCode().substring(0, 20),
      image: randomBytes,
      startDate,
      endDate,
      gameId: randomGameId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    }
  })
  .build()
