import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import PledgeCard from './pledge_card.js'
import Commend from './commend.js'

export default class Customer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phoneNumber: string | null

  @column()
  declare address: string | null

  @column()
  declare pledgeCard: string | null

  @column()
  declare pledgeCardUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => PledgeCard)
  declare pledgeCards: HasMany<typeof PledgeCard>

  @hasOne(() => Commend)
  declare commend: HasOne<typeof Commend>
}
