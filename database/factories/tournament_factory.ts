import factory from '@adonisjs/lucid/factories'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'
import Game from '#models/game'
import { FormatType, FormatTypeValues } from '#enums/format_type'

// Realistic tournament names
const tournamentNames = [
  'Championship',
  'Masters',
  'Grand Prix',
  'World Cup',
  'International',
  'Premier League',
  'Pro League',
  'Elite Series',
  'Champions League',
  'Super Cup',
  'All-Star',
  'Invitational',
  'Showdown',
  'Clash',
  'Battle Royale',
  'War Games',
  'Ultimate Challenge',
  'Epic Tournament',
  'Legendary Cup',
  'Elite Championship',
]

// Realistic prize pools
const prizePools = [1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000]

// Regions
const regions = ['Europe', 'North America', 'South America', 'Asia', 'Oceania', 'Africa', 'Global']

export const TournamentFactory = factory
  .define(Tournament, async ({ faker }) => {
    // Generate random image bytes
    const randomBytes = new Uint8Array(16)
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }

    const tiers = ['S', 'A', 'B', 'C']
    const tournamentName = faker.helpers.arrayElement(tournamentNames)
    const sponsorName = faker.company.name()

    // Generate number of players per team first
    const numberPlayersPerTeam = faker.number.int({ min: 1, max: 5 })

    // Generate participant count that is a multiple of players per team and a power of 2
    const teamOptions = [2, 4, 8, 16] // Number of teams (power of 2)
    const numberOfTeams = faker.helpers.arrayElement(teamOptions)
    const numberParticipants = numberOfTeams * numberPlayersPerTeam

    const price = faker.helpers.arrayElement(prizePools)

    // Generate consistent dates
    const startDate = DateTime.fromJSDate(faker.date.future())
    const duration = faker.number.int({ min: 1, max: 7 })
    const endDate = startDate.plus({ days: duration })

    const allGames = await Game.all()
    const randomGameId = faker.helpers.arrayElement(allGames).id
    const region = faker.helpers.arrayElement(regions)

    return {
      name: `${sponsorName} ${tournamentName}`,
      tier: faker.helpers.arrayElement(tiers),
      format: faker.helpers.arrayElement(FormatTypeValues) as FormatType,
      price,
      rules: faker.lorem.paragraph(2).substring(0, 250),
      numberParticipants,
      numberPlayersPerTeam,
      region,
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
