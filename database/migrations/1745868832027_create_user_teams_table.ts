import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.uuid('user_id').notNullable()
      table.uuid('team_id').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
