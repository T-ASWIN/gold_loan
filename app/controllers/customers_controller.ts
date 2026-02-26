import Customer from '#models/customer'
import CustomerService from '#services/customer_service'
import { createCustomerValidator } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Commend from '#models/commend'
import { DateTime } from 'luxon'

export default class CustomersController {
  async index({ view, auth }: HttpContext) {
    const customers = await Customer.query().preload('commend',(query) => {
    query.where('user_id', auth.user!.id)
  }).orderBy('created_at', 'desc')

    const user = auth.user!

    await user.load('role', (q) => q.preload('permissions'))

    const permissions = user.role.permissions.map((p) => p.name) ?? []

    return view.render('pages/customers/index', { customers, permissions })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/customers/new')
  }

  async store({ request, response, auth }: HttpContext) {
  try {
    const { pledgecards, commend, ...customerData } =
      await request.validateUsing(createCustomerValidator)

    const customer = await CustomerService.store(customerData, pledgecards)

    if (commend) {
      await Commend.updateOrCreate(
        {
          customerId: customer.id,
          userId: auth.user!.id,
        },
        {
          commendName: commend,
          scheduledAt: DateTime.now(),
        }
      )
    }

    return response.redirect().toRoute('customer.index')
  } catch (error) {
    console.log(error)
    return response.redirect().back()
  }
}

  async storeCommend({ request, response, auth }: HttpContext) {

    try {
          const user = auth.user!

      const {customer_id, commend_name} = request.only(['customer_id', 'commend_name'])

       const existingCommend = await Commend.query()
      .where('customer_id', customer_id)
      .where('user_id', user.id)
      .first()

      if (existingCommend) {
      existingCommend.commendName = commend_name
      await existingCommend.save()
    } else {
      await Commend.create({
        customerId: customer_id,
        userId: user.id,
        commendName: commend_name,
        scheduledAt: DateTime.now(),
      })
    }

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
      .preload('commend')
      .firstOrFail()

    return view.render('pages/customers/edit', { customer })
  }

  async update({ params, request, response, auth }: HttpContext) {
  try {
    const { pledgecards, commend, ...customerData } =
      await request.validateUsing(createCustomerValidator)

    const deleteImageIds = request.input('remove_image_ids', [])
    const removeCommend = request.input('remove_commend')

    const newFilePaths =
      pledgecards && Array.isArray(pledgecards)
        ? await Promise.all(
            pledgecards.map((file) =>
              CustomerService.storePlegdeCard(file)
            )
          )
        : []

    await CustomerService.update(
      params.id,
      customerData,
      {
        newFilePaths,
        deleteImageIds,
        commend,
        removeCommend,
        userId: auth.user!.id,
      }
    )

    return response.redirect().toRoute('customer.index')
  } catch (error) {
    console.log(error)
    return response.redirect().back()
  }
}


  async show({ params, view, auth }: HttpContext) {
  const customer = await Customer.query()
    .where('id', params.id)
    .preload('commend', (query) => {
      query.where('user_id', auth.user!.id)
    })
    .preload('pledgeCards')     .firstOrFail()

  return view.render('pages/customers/show', {
    customer,
  })
}

  async destroy({ params, response }: HttpContext) {
    try {
      await CustomerService.delete(params.id)
      return response.redirect().toRoute('customer.index')
    } catch (error) {
      return response.redirect().back()
    }
  }
}
