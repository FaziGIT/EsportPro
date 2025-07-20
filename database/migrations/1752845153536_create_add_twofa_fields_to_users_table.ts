import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_2fa_enabled').defaultTo(false)
      table.string('twofa_secret', 255).nullable()
      table.text('twofa_recovery_codes').nullable()
      table.timestamp('twofa_confirmed_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_2fa_enabled')
      table.dropColumn('twofa_secret')
      table.dropColumn('twofa_recovery_codes')
      table.dropColumn('twofa_confirmed_at')
    })
  }
}
