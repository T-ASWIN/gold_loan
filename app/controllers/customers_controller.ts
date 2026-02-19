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
    const { pledgecards, ...customerData } = await request.validateUsing(createCustomerValidator)

    const filePaths = (pledgecards && Array.isArray(pledgecards))
       ? await Promise.all(pledgecards.map(file => CustomerService.storePlegdeCard(file)))
      : []

    await db.transaction(async (trx) => {
      await CustomerService.create(customerData, filePaths, trx)
    })

    return response.redirect().toRoute('customer.index')
  } catch (error) {
    return response.redirect().back()
  }
}


  async edit({ params, view }: HttpContext) {
    
    const customer = await Customer.query().where('id',params.id).preload('pledgeCards').firstOrFail()

    return view.render('pages/customers/edit', { customer })
  }


  async update({ params, request, response }: HttpContext) {
    try {
      const { pledgecards, ...customerData } = await request.validateUsing(createCustomerValidator)

      const deleteIds = request.input('remove_image_ids',[])

      const newFilePaths = (pledgecards && Array.isArray(pledgecards))
       ? await Promise.all(pledgecards.map(file => CustomerService.storePlegdeCard(file)))
       : []

      await db.transaction(async(trx)=>{
        await CustomerService.update(params.id, customerData, newFilePaths, deleteIds, trx)
      })

      return response.redirect().toRoute('customer.index')
    } catch (error) {
      return response.redirect().back()
    }
  }

    async destroy({ params, response }: HttpContext) {
      try {
        await CustomerService.delete(params.id)
        return response.redirect().toRoute('customer.index')
      } catch (error) {
         console.error('DELETE_ERROR:', error)
         return response.redirect().back()
      }
   }
}
