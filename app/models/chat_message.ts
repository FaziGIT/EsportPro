import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Channel from './channel.js'
import User from './user.js'

export default class ChatMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

  @column()
  declare userId: number
  
  @belongsTo(() => User, {
    foreignKey: 'userId'
  })
  declare user: BelongsTo<typeof User>
  
  @column()
  declare channelId: number
  
  @belongsTo(() => Channel, {
    foreignKey: 'channelId'
  })
  declare channel: BelongsTo<typeof Channel>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}