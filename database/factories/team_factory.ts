import factory from '@adonisjs/lucid/factories'
import Team from '#models/team'
import Tournament from '#models/tournament'
import { UserFactory } from '#database/factories/user_factory'

// Realistic esport team names
const teamNames = [
  'Cloud9',
  'Team Liquid',
  'Fnatic',
  'G2 Esports',
  'Team SoloMid',
  'Evil Geniuses',
  '100 Thieves',
  'FaZe Clan',
  'Natus Vincere',
  'Astralis',
  'Virtus.pro',
  'Ninjas in Pyjamas',
  'MOUZ',
  'Heroic',
  'Vitality',
  'ENCE',
  'Complexity Gaming',
  'Team Spirit',
  'Gambit Esports',
  'BIG',
  'OG',
  'Team Secret',
  'Alliance',
  'Team Empire',
  'SK Gaming',
  'Immortals',
  'OpTic Gaming',
  'NRG Esports',
  'Sentinels',
  'Squad',
  'Legion',
  'Phoenix',
  'Dragons',
  'Wolves',
  'Eagles',
  'Lions',
  'Tigers',
  'Sharks',
  'Ravens',
]

export const TeamFactory = factory
  .define(Team, async ({ faker }) => {
    const allTournaments = await Tournament.all()
    const randomTournamentId = faker.helpers.arrayElement(allTournaments).id
    const teamName = faker.helpers.arrayElement(teamNames)

    return {
      name: teamName,
      isWinner: false,
      tournamentId: randomTournamentId,
    }
  })
  .relation('players', () => UserFactory)
  .build()
