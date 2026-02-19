import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  // Change this to the actual table name, not the migration action
  protected tableName = 'customer_pledge_cards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Link to the customer
      table
        .integer('customer_id')
        .unsigned()
        .references('id')
        .inTable('customers')
        .onDelete('CASCADE') // Critical for automatic cleanup

      // The actual path to the image
      table.string('pledge_card').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}