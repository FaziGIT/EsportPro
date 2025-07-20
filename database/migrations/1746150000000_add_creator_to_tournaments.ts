import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tournaments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('creator_id').nullable()
      table.boolean('is_started').defaultTo(false).notNullable()

      table.foreign('creator_id').references('users.id').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['creator_id'])
      table.dropColumn('creator_id')
      table.dropColumn('is_started')
    })
  }
}
