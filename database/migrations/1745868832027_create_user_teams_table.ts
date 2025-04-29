import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().notNullable()
      table.integer('team_id').unsigned().notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}