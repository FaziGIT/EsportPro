import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.uuid('team1_id').unsigned().notNullable()
      table.uuid('team2_id').unsigned().notNullable()

      table.integer('score_team1').notNullable()
      table.integer('score_team2').notNullable()

      table.uuid('winner_id').unsigned().nullable()
      table.uuid('next_match_id').unsigned().nullable()
      table.uuid('tournament_id').unsigned().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}