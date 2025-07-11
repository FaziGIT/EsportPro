import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import User from './user.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { GamePlatform } from '#enums/game_platform'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare platform: GamePlatform

  @column()
  declare image: Uint8Array

  @manyToMany(() => User, {
    pivotTable: 'bookmarks',
    pivotTimestamps: { createdAt: true, updatedAt: false },
  })
  declare favoriteOfUsers: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'user_game_infos',
    pivotColumns: ['elo', 'pseudo', 'region'],
    pivotTimestamps: true,
    pivotForeignKey: 'game_id',
    pivotRelatedForeignKey: 'user_id',
  })
  declare users: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
