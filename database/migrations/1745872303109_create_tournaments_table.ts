import { BaseSchema } from '@adonisjs/lucid/schema'
import { FormatType, FormatTypeValues } from '#enums/format_type'
import { TierType, TierTypeValues } from '#enums/tier_type'

export default class extends BaseSchema {
  protected tableName = 'tournaments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('name').notNullable()
      table.enu('tier', TierTypeValues).defaultTo(TierType.Beginner).notNullable()
      table.decimal('price').notNullable()
      table.string('rules').notNullable()
      table.integer('number_participants').notNullable()
      table.integer('number_players_per_team').defaultTo(1)
      table.string('region')
      table.string('address')
      table.string('city')
      table.string('country')
      table.string('postal_code')
      table.binary('image')
      table.dateTime('start_date').notNullable()
      table.dateTime('end_date').notNullable()
      table.enu('format', FormatTypeValues).defaultTo(FormatType.BO3).notNullable()
      table.boolean('is_validated').defaultTo(false).notNullable()

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
