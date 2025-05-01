import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chat_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('content').notNullable()

      table
        .integer('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table
        .integer('channel_id')
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}