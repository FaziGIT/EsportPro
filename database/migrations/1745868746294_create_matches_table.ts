import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('team1_id').unsigned().notNullable()
      table.integer('team2_id').unsigned().notNullable()

      table.integer('score_team1').notNullable()
      table.integer('score_team2').notNullable()

      table.integer('winner_id').unsigned().nullable()
      table.integer('next_match_id').unsigned().nullable()
      table.integer('tournament_id').unsigned().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}