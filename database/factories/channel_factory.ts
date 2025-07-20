import factory from '@adonisjs/lucid/factories'
import Channel from '#models/channel'
import { ChannelEntityType } from '#enums/channel_entity_type'
import Tournament from '#models/tournament'
import Team from '#models/team'

export const ChannelFactory = factory
  .define(Channel, async ({ faker }) => {
    const allTournaments = await Tournament.all()
    const allTeams = await Team.all()

    const entityType = faker.helpers.arrayElement(Object.values(ChannelEntityType))

    let tournamentId = null
    let teamId = null

    if (entityType === ChannelEntityType.Tournament) {
      tournamentId = faker.helpers.arrayElement(allTournaments).id
    } else if (entityType === ChannelEntityType.Team) {
      teamId = faker.helpers.arrayElement(allTeams).id
    }

    return {
      name: faker.lorem.words(1),
      entityType,
      tournamentId,
      teamId,
    }
  })
  .build()
