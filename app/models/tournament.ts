import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Team from './team.js'
import Game from './game.js'
import Channel from './channel.js'
import Match from './match.js'

export default class Tournament extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

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

  @column()
  declare winnerId: string | null

  @belongsTo(() => Team)
  declare winner: BelongsTo<typeof Team>

  @hasMany(() => Team)
  declare teams: HasMany<typeof Team>

  @column()
  declare gameId: string

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @hasOne(() => Channel)
  declare channel: HasOne<typeof Channel>

  @hasMany(() => Match, {
    foreignKey: 'team1Id',
  })
  declare matchesHasTeam1: HasMany<typeof Match>

  @hasMany(() => Match, {
    foreignKey: 'team2Id',
  })
  declare matchesHasTeam2: HasMany<typeof Match>

  @hasMany(() => Match, {
    foreignKey: 'winnerId',
  })
  declare matchesWon: HasMany<typeof Match>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
