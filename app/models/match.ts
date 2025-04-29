import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import Team from './team.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Tournament from './tournament.js'

export default class Match extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @hasOne(() => Team)
  declare team1: HasOne<typeof Team>

  @hasOne(() => Team)
  declare team2: HasOne<typeof Team>

  @column()
  declare scoreTeam1: number

  @column()
  declare scoreTeam2: number

  @hasOne(() => Team)
  declare winner: HasOne<typeof Team>

  @hasOne(() => Match)
  declare nextMatch: HasOne<typeof Match>

  @hasOne(() => Tournament)
  declare tournament: HasOne<typeof Tournament>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}