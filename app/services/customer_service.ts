import Customer from '#models/customer'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import fs from 'node:fs/promises'

export default class CustomerService {
  static async create(data: any, trx: TransactionClientContract) {
    return await Customer.create(
      {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        pledgeCard: data.pledgeCardUrl,
      },
      { client: trx }
    )
  }

  static async update(id: number, data: any) {
    const customer = await Customer.findOrFail(id)

    // Determine if we should delete the existing file
    // (Either user clicked X, or they uploaded a new file to replace it)
    if ((data.forceDelete || data.pledgeCardUrl) && customer.pledgeCard) {
      const oldPath = app.makePath('public', customer.pledgeCard)
      try {
        await fs.unlink(oldPath)
      } catch (e) {
        // file might not exist on disk, ignore
      }

      // If they just clicked X but didn't upload a new one, set column to null
      if (data.forceDelete && !data.pledgeCardUrl) {
        customer.pledgeCard = null
      }
    }

    // Update other fields
    customer.merge({
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
    })

    // If a new file was uploaded, set the new path
    if (data.pledgeCardUrl) {
      customer.pledgeCard = data.pledgeCardUrl
    }

    return await customer.save()
  }

  static async storePlegdeCard(pledge_card: MultipartFile) {
    const fileName = `${cuid()}.${pledge_card.extname}`
    const relativePath = 'customer/pledgeCard' // Clean directory structure

    await pledge_card.move(app.makePath('public', relativePath), {
      name: fileName,
    })

    // Return only the path relative to 'public'
    return `${relativePath}/${fileName}`
  }
}
