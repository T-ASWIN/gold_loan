import Customer from '#models/customer'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import fs from 'node:fs/promises'

export default class CustomerService {
  static async storePlegdeCard(file: MultipartFile): Promise<string> {
    const fileName = `${cuid()}.${file.extname}`
    const localPath = `customer/pledgeCard/${fileName}`

    await file.move(app.makePath('public/customer/pledgeCard'), {
      name: fileName,
    })

    return localPath
  }

  static async store(
  customerData: any,
  pledgecards: MultipartFile[] | undefined,
  
) {
  console.log('SERVICE STORE - customerData:', customerData)
  console.log('SERVICE STORE - pledgecards:', pledgecards?.length)

  const filePaths =
    pledgecards && Array.isArray(pledgecards)
      ? await Promise.all(
          pledgecards.map((file) =>
            CustomerService.storePlegdeCard(file)
          )
        )
      : []

  console.log('FILE PATHS:', filePaths)

  try {
    await db.transaction(async (trx) => {
      console.log('INSIDE TRANSACTION')

      const customer = await Customer.create(
        {
          name: customerData.name,
          email: customerData.email,
          phoneNumber: customerData.phoneNumber,
          address: customerData.address,
        },
        { client: trx }
      )

      console.log('CUSTOMER CREATED:', customer.id)

      if (filePaths.length > 0) {
        const pledgeData = filePaths.map((path) => ({
          pledgeCard: path,
        }))

        await customer
          .related('pledgeCards')
          .createMany(pledgeData, { client: trx })
      }

      

      console.log('TRANSACTION SUCCESS')
    })
  } catch (error) {
    console.error('TRANSACTION ERROR:', error)
    throw error
  }
}

  static async update(
    id: number,
    data: any,
    newFilePaths: string[],
    deleteIds: number[],
    trx: TransactionClientContract
  ) {
    const customer = await Customer.findOrFail(id, { client: trx })

    customer.merge(data)
    customer.useTransaction(trx)
    await customer.save()

    if (deleteIds.length > 0) {
      const deletePledge = await customer.related('pledgeCards').query().whereIn('id', deleteIds)

      for (const pledge of deletePledge) {
        try {
          const absolutePath = app.makePath('public', pledge.pledgeCard)
          await fs.unlink(absolutePath)
        } catch (error) {
          console.error(`Could not delete file: ${pledge.pledgeCard}`, error)
        }
      }

      await customer
        .related('pledgeCards')
        .query()
        .useTransaction(trx)
        .whereIn('id', deleteIds)
        .delete()
    }

    if (newFilePaths.length > 0) {
      const pledgeData = newFilePaths.map((path) => ({ pledgeCard: path }))
      await customer.related('pledgeCards').createMany(pledgeData, { client: trx })
    }
  }

  static async delete(id: number) {
    const customer = await Customer.query().where('id', id).preload('pledgeCards').firstOrFail()

    for (const card of customer.pledgeCards) {
      try {
        const absolutePath = app.makePath('public', card.pledgeCard)
        await fs.unlink(absolutePath)
      } catch (error) {
        console.error(`Cleanup error during customer delete for file ${card.pledgeCard}:`, error)
      }
    }
    await customer.delete()
  }
}