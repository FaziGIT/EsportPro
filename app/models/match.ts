import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Team from './team.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tournament from './tournament.js'

export default class Match extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare team1Id: string

  @belongsTo(() => Team)
  declare team1: BelongsTo<typeof Team>

  @column()
  declare team2Id: string

  @belongsTo(() => Team)
  declare team2: BelongsTo<typeof Team>

  @column()
  declare scoreTeam1: number

  @column()
  declare scoreTeam2: number

  @column()
  declare winnerId: string | null

  @belongsTo(() => Team)
  declare winner: BelongsTo<typeof Team>

  @column()
  declare nextMatchId: string | null

  @belongsTo(() => Match)
  declare nextMatch: BelongsTo<typeof Match>

  @hasMany(() => Match, {
    foreignKey: 'nextMatchId',
  })
  declare matches: HasMany<typeof Match>

  @column()
  declare tournamentId: string

  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
