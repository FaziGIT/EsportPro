import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import Tournament from './tournament.js'
import Team from './team.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare entityType: 'tournament' | 'team' 

  @column()
  declare tournamentId: number | null
  
  @column()
  declare teamId: number | null

  @belongsTo(() => Tournament, {
    foreignKey: 'tournamentId',
    onQuery: (query) => query.where('entityType', 'tournament'),
  })
  declare tournament: BelongsTo<typeof Tournament>

  @belongsTo(() => Team, {
    foreignKey: 'teamId',
    onQuery: (query) => query.where('entityType', 'team'),
  })
  declare team: BelongsTo<typeof Team>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static validateEntityType(channel: Channel) {
    if (channel.entityType && !['tournament', 'team'].includes(channel.entityType)) {
      throw new Error('entityType must be either "tournament" or "team"')
    }
    
    if (channel.entityType === 'tournament' && channel.teamId !== null) {
      throw new Error('Un canal de type tournament ne peut pas avoir de team_id')
    }
    
    if (channel.entityType === 'team' && channel.tournamentId !== null) {
      throw new Error('Un canal de type team ne peut pas avoir de tournament_id')
    }
  }
}