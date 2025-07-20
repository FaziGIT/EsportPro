import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Team from './team.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tournament from './tournament.js'

export default class Match extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'team1_id' })
  declare team1Id: string | null

  @belongsTo(() => Team, {
    foreignKey: 'team1Id',
  })
  declare team1: BelongsTo<typeof Team>

  @column({ columnName: 'team2_id' })
  declare team2Id: string | null

  @belongsTo(() => Team, {
    foreignKey: 'team2Id',
  })
  declare team2: BelongsTo<typeof Team>

  @column({ columnName: 'score_team_1' })
  declare scoreTeam1: number

  @column({ columnName: 'score_team_2' })
  declare scoreTeam2: number

  @column()
  declare winnerId: string | null

  @belongsTo(() => Team, {
    foreignKey: 'winnerId',
  })
  declare winner: BelongsTo<typeof Team>

  @column()
  declare nextMatchId: string | null

  @belongsTo(() => Match)
  declare nextMatch: BelongsTo<typeof Match>

  @hasMany(() => Match, {
    foreignKey: 'nextMatchId',
  })
  declare previousMatches: HasMany<typeof Match>

  @column()
  declare tournamentId: string

  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
