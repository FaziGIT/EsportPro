import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.enum('entity_type', ['tournament', 'team']).notNullable()

      table
        .integer('tournament_id')
        .references('id')
        .inTable('tournaments')
        .onDelete('CASCADE')

      table
        .integer('team_id')
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}