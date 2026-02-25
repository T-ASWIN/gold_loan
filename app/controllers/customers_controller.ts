import Customer from '#models/customer'
import CustomerService from '#services/customer_service'
import { createCustomerValidator } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Commend from '#models/commend'
import { DateTime } from 'luxon'

export default class CustomersController {
  async index({ view ,auth}: HttpContext) {
    const customers = await Customer.query().preload('commends').orderBy('created_at', 'desc')

    const user = auth.user!

    await user.load('role', (q) => q.preload('permissions'))

    const permissions = user.role.permissions.map((p) => p.name) ?? []



    return view.render('pages/customers/index', { customers, permissions })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/customers/new')
  }

  async store({ request, response, session }: HttpContext) {

    try {
    const { pledgecards, commends, ...customerData } =
      await request.validateUsing(createCustomerValidator)

    console.log('FILES:', pledgecards?.length)
    console.log('COMMENDS:', commends)

    await CustomerService.store(customerData, pledgecards, commends)

    return response.redirect().toRoute('customer.index')
  } catch {
  return response.redirect().back()
}
  }


  async show({ view, params }: HttpContext) {
    const customer = await Customer.query()
      .preload('pledgeCards')
      .preload('commends')
      .where('id', params.id)
      .first()

  
    return view.render('pages/customers/show', { customer })
  }

  async storeCommend({ request, response }: HttpContext) {
    try {
      const data = request.only(['customer_id', 'commend_name', 'scheduled_at'])

      await Commend.create({
        customerId: data.customer_id,
        commendName: data.commend_name,
        scheduledAt: DateTime.now(),
      })

      return response.redirect().back()
    } catch (error) {
      console.error('COMMEND_STORE_ERROR:', error)
      return response.redirect().back()
    }
  }

  async edit({ params, view }: HttpContext) {
    const customer = await Customer.query()
      .where('id', params.id)
      .preload('pledgeCards')
      .preload('commends')
      .firstOrFail()

    return view.render('pages/customers/edit', { customer })
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const { pledgecards, commends, ...customerData } =
        await request.validateUsing(createCustomerValidator)

      const deleteIds = request.input('remove_image_ids', [])
      const deleteCommendIds = request.input('remove_commend_ids', [])
      const existingCommends = request.input('existing_commends', {})

      const newFilePaths =
        pledgecards && Array.isArray(pledgecards)
          ? await Promise.all(pledgecards.map((file) => CustomerService.storePlegdeCard(file)))
          : []

      await db.transaction(async (trx) => {
        await CustomerService.update(params.id, customerData, newFilePaths, deleteIds, trx)

        for (const id in existingCommends) {
          const value = existingCommends[id].trim()

          if (value !== '') {
            await Commend.query({ client: trx }).where('id', id).update({
              commend_name: value,
              updated_at: new Date(),
            })
          }
        }

        if (deleteCommendIds.length) {
          await Commend.query({ client: trx }).whereIn('id', deleteCommendIds).delete()
        }

        const newCommends = (commends || []).map((c) => c.trim()).filter((c) => c !== '')

        if (newCommends.length) {
          await Promise.all(
            newCommends.map((cmd) => {
              return Commend.create(
                {
                  customerId: params.id,
                  commendName: cmd,
                  scheduledAt: DateTime.now(),
                },
                { client: trx }
              )
            })
          )
        }
      })
      return response.redirect().toRoute('customer.index')
    } catch (error) {
      console.log(error)
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
