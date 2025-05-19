import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import Tournament from './tournament.js'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Channel from './channel.js'
import Match from './match.js'

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
    pivotTable: 'user_teams',
    pivotTimestamps: true,
  })
  declare players: ManyToMany<typeof User>

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

  async getAllMatches() {
    const [asTeam1, asTeam2] = await Promise.all([
      Match.query().where('team1Id', this.id).orderBy('createdAt', 'desc'),
      Match.query().where('team2Id', this.id).orderBy('createdAt', 'desc'),
    ])

    return [...asTeam1, ...asTeam2].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  }
}
