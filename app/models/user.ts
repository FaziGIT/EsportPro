import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Game from './game.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Team from './team.js'
import ChatMessage from './chat_message.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare pseudo: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isPrivate: boolean

  @manyToMany(() => Game, {
    pivotTable: 'bookmarks',
  })
  declare favoriteGames: ManyToMany<typeof Game>

  @manyToMany(() => Game, {
    pivotTable: 'user_games_infos',
  })
  declare gameInfos: ManyToMany<typeof Game>

  @manyToMany(() => Team, {
    pivotTable: 'user_teams',
  })
  declare teams: ManyToMany<typeof Team>

  @hasMany(() => ChatMessage)
  declare messages: HasMany<typeof ChatMessage>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
