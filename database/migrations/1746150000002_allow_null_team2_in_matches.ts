import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('team1_id').nullable().alter()
      table.uuid('team2_id').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert back to not null
      table.uuid('team1_id').notNullable().alter()
      table.uuid('team2_id').notNullable().alter()
    })
  }
}
