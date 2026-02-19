import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  // This must be the actual name of your existing table
  protected tableName = 'customers'

  async up() {
    // Use alterTable to modify the existing customers table
    this.schema.alterTable(this.tableName, (table) => {
      // Remove the old single-image columns
      table.dropColumn('pledge_card')
      table.dropColumn('pledge_card_url')
    })
  }

  async down() {
    // Reverse the change: add the columns back if you rollback
    this.schema.alterTable(this.tableName, (table) => {
      table.string('pledge_card').nullable()
      table.string('pledge_card_url').nullable()
    })
  }
}