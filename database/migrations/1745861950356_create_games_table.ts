import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('name', 255).notNullable()
      table.string('platform', 255).notNullable()
      table.binary('image').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}