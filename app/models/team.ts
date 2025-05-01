import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import Tournament from './tournament.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Team extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare isWinner: boolean

  @column()
  declare tournamentId: string

  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @manyToMany(() => User, {
    pivotTable: 'user_teams'
  })
  declare players: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}