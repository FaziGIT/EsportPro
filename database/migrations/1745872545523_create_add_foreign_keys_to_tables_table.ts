import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('bookmarks', (table) => {
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table
        .foreign('game_id')
        .references('id')
        .inTable('games')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
    })

    this.schema.alterTable('user_game_infos', (table) => {
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table
        .foreign('game_id')
        .references('id')
        .inTable('games')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
    })

    this.schema.alterTable('matches', (table) => {
      table
        .foreign('tournament_id')
        .references('id')
        .inTable('tournaments')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')

      table
        .foreign('team1_id')
        .references('id')
        .inTable('teams')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')

      table
        .foreign('team2_id')
        .references('id')
        .inTable('teams')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')

      table
        .foreign('winner_id')
        .references('id')
        .inTable('teams')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')

      table
        .foreign('next_match_id')
        .references('id')
        .inTable('matches')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
    })

    this.schema.alterTable('tournaments', (table) => {
      table
        .foreign('winner_id')
        .references('id')
        .inTable('teams')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')

      table
        .foreign('game_id')
        .references('id')
        .inTable('games')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
    })

    this.schema.alterTable('teams', (table) => {
      table
        .foreign('tournament_id')
        .references('id')
        .inTable('tournaments')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
    })
  }
}
