import { BaseSchema } from '@adonisjs/lucid/schema'
import { ChannelEntityTypeValues } from '#enums/channel_entity_type'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('name').notNullable()
      table.enu('entity_type', ChannelEntityTypeValues).notNullable()

      table.uuid('tournament_id').references('id').inTable('tournaments').onDelete('CASCADE')

      table.uuid('team_id').references('id').inTable('teams').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
