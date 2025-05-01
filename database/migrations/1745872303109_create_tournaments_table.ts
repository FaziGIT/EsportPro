import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tournaments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('tier').notNullable()
      table.string('format').notNullable()
      table.string('price').notNullable()
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
      
      table.integer('winner_id').unsigned().nullable()
      table.integer('game_id').unsigned().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}