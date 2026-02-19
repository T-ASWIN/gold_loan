import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Customer from './customer.js'

export default class PledgeCard extends BaseModel {
  public static table = 'customer_pledge_cards'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare customerId: number

  @column()
  declare pledgeCard: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=> Customer)
   declare customer: BelongsTo<typeof Customer>
}