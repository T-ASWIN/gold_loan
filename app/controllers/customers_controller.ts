import Customer from '#models/customer'
import CustomerService from '#services/customer_service'
import { createCustomerValidator } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class CustomersController {
  async index({ view }: HttpContext) {
    const customers = await Customer.query().orderBy('created_at', 'desc')
    return view.render('pages/customers/index', { customers })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/customers/new')
  }

  async store({ request, response }: HttpContext) {
    try {
      // 1. Validate
      const payload = await request.validateUsing(createCustomerValidator)
      const { pledgecard, ...customerData } = payload

      // 2. Determine the file path (keep it separate for now)
      let filePath: string | null = null
      if (pledgecard) {
        filePath = await CustomerService.storePlegdeCard(pledgecard)
      }

      // 3. Run Transaction
      await db.transaction(async (trx) => {
        // Merge the data right here. This creates a NEW object that
        // satisfies the Service requirements perfectly.
        await CustomerService.create(
          {
            ...customerData,
            pledgeCardUrl: filePath,
          },
          trx
        )
      })

      return response.redirect().toRoute('customer.index')
    } catch (error) {
      // It's helpful to log the error during development
      console.error(error)
      return response.redirect().back()
    }
  }
  async edit({ params, view }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)
    return view.render('pages/customers/edit', { customer })
  }

  // app/controllers/customers_controller.ts

  async update({ params, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createCustomerValidator)
      const { pledgecard, ...customerData } = payload

      const shouldDelete = request.input('delete_pledge_card') === 'true'

      let filePath: string | null = null

      // Process the file if it exists in the request
      if (pledgecard) {
        filePath = await CustomerService.storePlegdeCard(pledgecard)
      }

      await CustomerService.update(params.id, {
        ...customerData,
        pledgeCardUrl: filePath,
        forceDelete: shouldDelete,
      })

      return response.redirect().toRoute('customer.index')
    } catch (error) {
      console.error('UPDATE_ERROR:', error) // Check your terminal for specific SQL errors
      return response.redirect().back()
    }
  }
  async destroy({ params, response }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)
    await customer.delete()

    return response.redirect().toRoute('customer.index')
  }
}
