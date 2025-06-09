import { BaseSchema } from '@adonisjs/lucid/schema'
import { FormatType, FormatTypeValues } from '#enums/format_type'

export default class extends BaseSchema {
  protected tableName = 'tournaments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('name').notNullable()
      table.string('tier').notNullable()
      table.decimal('price').notNullable()
      table.string('rules').notNullable()
      table.integer('number_participants').notNullable()
      table.integer('number_players_per_team').notNullable()
      table.string('region').notNullable()
      table.string('address').notNullable()
      table.string('city').notNullable()
      table.string('country').notNullable()
      table.string('postal_code').notNullable()
      table.binary('image').notNullable()
      table.dateTime('start_date').notNullable()
      table.dateTime('end_date').notNullable()
      table.enu('format', FormatTypeValues).defaultTo(FormatType.BO3)

      table.uuid('winner_id').nullable().defaultTo(null)
      table.uuid('game_id').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
