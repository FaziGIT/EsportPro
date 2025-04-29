import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import Tournament from './tournament.js'
import type { HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Team extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare isWinner: boolean

  @hasOne(() => Tournament)
  declare tournament: HasOne<typeof Tournament>

  @manyToMany(() => User, {
    pivotTable: 'user_teams'
  })
  declare players: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}