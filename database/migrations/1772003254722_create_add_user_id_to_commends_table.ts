import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commends'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // Optional but recommended
      table.unique(['user_id', 'customer_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['user_id', 'customer_id'])
      table.dropColumn('user_id')
    })
  }
}