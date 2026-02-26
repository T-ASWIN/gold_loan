import Commend from '#models/commend'
import Customer from '#models/customer'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
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
  pledgecards?: MultipartFile[]
  
) {

  let filePaths: string[] = []

if (pledgecards && Array.isArray(pledgecards)) {
  for (const file of pledgecards) {
    const path = await CustomerService.storePlegdeCard(file)
    filePaths.push(path)
  }
}

    let createdCustomer: Customer  


  try {
    await db.transaction(async (trx) => {

      const customer = await Customer.create(
        {
          name: customerData.name,
          email: customerData.email,
          phoneNumber: customerData.phoneNumber,
          address: customerData.address,
        },
        { client: trx }
      )

      createdCustomer = customer 


      if (filePaths.length) {
        const pledgeData = filePaths.map((path) => ({
          pledgeCard: path,
        }))

        await customer
          .related('pledgeCards')
          .createMany(pledgeData, { client: trx })
      }

      

    })
  } catch (error) {
    throw error
  }
   return createdCustomer! 
}

  
  static async update(
  customerId: number,
  data: any,
  options: {
    newFilePaths?: string[]
    deleteImageIds?: number[]
    commend?: string
    removeCommend?: string
    userId: number
  }
) {
  await db.transaction(async (trx) => {

    const customer = await Customer.findOrFail(customerId, { client: trx })

    customer.merge(data)
    await customer.useTransaction(trx).save()

    const deleteIds = options.deleteImageIds ?? []
    const newFiles = options.newFilePaths ?? []

    if (deleteIds.length) {
      await customer
        .related('pledgeCards')
        .query()
        .whereIn('id', deleteIds)
        .delete()
    }

    if (newFiles.length) {
      await customer.related('pledgeCards').createMany(
        newFiles.map((path) => ({
          pledgeCard: path,
        })),
        { client: trx }
      )
    }

    if (options.removeCommend) {
      await Commend.query({ client: trx })
        .where('customer_id', customerId)
        .where('user_id', options.userId)
        .delete()
    }

    else if (options.commend) {
      await Commend.updateOrCreate(
        {
          customerId: customerId,
          userId: options.userId,
        },
        {
          commendName: options.commend,
        },
        { client: trx }
      )
    }
  })
}

  static async delete(id: number) {
    const customer = await Customer.query().where('id', id).preload('pledgeCards').firstOrFail()

    for (const card of customer.pledgeCards) {
      try {
        const absolutePath = app.makePath('public', card.pledgeCard)
        await fs.unlink(absolutePath)
      } catch (error) {
      }
    }
    await customer.delete()
  }
}