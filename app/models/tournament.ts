import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Team from './team.js'
import Game from './game.js'
import Channel from './channel.js'
import { FormatType } from '#enums/format_type'
import { TierType } from '#enums/tier_type'

export default class Tournament extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare tier: TierType

  @column()
  declare format: FormatType

  @column()
  declare price: number

  @column()
  declare rules: string

  @column()
  declare numberParticipants: number

  @column()
  declare numberPlayersPerTeam: number | null

  @column()
  declare region: string | null

  @column()
  declare address: string | null

  @column()
  declare city: string | null

  @column()
  declare country: string | null

  @column()
  declare postalCode: string | null

  @column()
  declare image: Uint8Array

  @column()
  declare startDate: DateTime

  @column()
  declare endDate: DateTime

  @column()
  declare isValidated: boolean

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
