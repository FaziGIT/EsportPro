import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Team from './team.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tournament from './tournament.js'

export default class Match extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare team1Id: number

  @belongsTo(() => Team)
  declare team1: BelongsTo<typeof Team>

  @column()
  declare team2Id: number

  @belongsTo(() => Team)
  declare team2: BelongsTo<typeof Team>

  @column()
  declare scoreTeam1: number

  @column()
  declare scoreTeam2: number

  @column()
  declare winnerId: number | null


  @belongsTo(() => Team)
  declare winner: BelongsTo<typeof Team>

  @column()
  declare nextMatchId: number | null

  @belongsTo(() => Match)
  declare nextMatch: BelongsTo<typeof Match>

  @column()
  declare tournamentId: number
  
  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}