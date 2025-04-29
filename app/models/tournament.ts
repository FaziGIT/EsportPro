import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Team from './team.js'
import Game from './game.js'

export default class Tournament extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare tier: string

  @column()
  declare format: string

  @column()
  declare price: number

  @column()
  declare rules: string

  @column()
  declare numberParticipants: number

  @column()
  declare numberPlayersPerTeam: number

  @column()
  declare region: string

  @column()
  declare address: string

  @column()
  declare city: string

  @column()
  declare country: string

  @column()
  declare postalCode: string

  @column()
  declare image: Uint8Array

  @column()
  declare startDate: DateTime

  @column()
  declare endDate: DateTime

  @hasOne(() => Team)
  declare winner: HasOne<typeof Team>

  @hasMany(() => Team)
  declare teams: HasMany<typeof Team>

  @hasOne(() => Game)
  declare game: HasOne<typeof Game>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}