import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Tournament from './tournament.js'
import Team from './team.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ChatMessage from './chat_message.js'
import { ChannelEntityType } from '#enums/channel_entity_type'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare entityType: ChannelEntityType

  @column()
  declare tournamentId: string | null

  @belongsTo(() => Tournament, {
    onQuery: (query) => query.where('entityType', 'tournament'),
  })
  declare tournament: BelongsTo<typeof Tournament>

  @column()
  declare teamId: string | null

  @belongsTo(() => Team, {
    onQuery: (query) => query.where('entityType', 'team'),
  })
  declare team: BelongsTo<typeof Team>

  @hasMany(() => ChatMessage)
  declare messages: HasMany<typeof ChatMessage>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static validateEntityType(channel: Channel) {
    if (channel.entityType && !Object.values(ChannelEntityType).includes(channel.entityType)) {
      throw new Error(
        `entityType doit être une des valeurs suivantes : ${Object.values(ChannelEntityType).join(', ')}`
      )
    }

    if (channel.entityType === ChannelEntityType.Tournament && channel.teamId !== null) {
      throw new Error('Un canal de type tournament ne peut pas avoir de team_id')
    }

    if (channel.entityType === ChannelEntityType.Team && channel.tournamentId !== null) {
      throw new Error('Un canal de type team ne peut pas avoir de tournament_id')
    }
  }
}
