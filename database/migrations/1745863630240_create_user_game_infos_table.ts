import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_game_infos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().notNullable()
      table.integer('game_id').unsigned().notNullable()

      table.string('elo', 255).notNullable()
      table.string('pseudo', 255).notNullable()
      table.string('region', 255).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}