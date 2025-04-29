import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.boolean('is_winner').nullable().defaultTo(null)
      
      table.integer('tournament_id').unsigned().notNullable()

      table.dateTime('created_at').notNullable()
      table.dateTime('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}