import Customer from '#models/customer'
import CustomerService from '#services/customer_service'
import { createCustomerValidator } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Command from '#models/command'
import { DateTime } from 'luxon'


export default class CustomersController {
  async index({ view }: HttpContext) {
    const customers = await Customer.query().preload('commands').orderBy('created_at', 'desc')
    return view.render('pages/customers/index', { customers })
  }

    async create({ view }: HttpContext) {
      return view.render('pages/customers/new')
    }

    async store({ request, response }: HttpContext) {
          console.log(request.all())

    try {
      const { pledgecards, commands, ...customerData } = await request.validateUsing(createCustomerValidator)

          console.log('commands:', commands)


      const filePaths = (pledgecards && Array.isArray(pledgecards))
        ? await Promise.all(pledgecards.map(file => CustomerService.storePlegdeCard(file)))
        : []

      await db.transaction(async (trx) => {
      
      const customer =  await CustomerService.create(customerData, filePaths, trx)

            console.log('filtered commands before insert:', commands)


        if (commands && commands.length) {
          const customer_commands = commands.filter(command => command.trim() !== '')
          
                 console.log('after filter:', customer_commands)


          await Promise.all(
            customer_commands.map(command => {
              return trx.insertQuery()
                .table('commands')
                .insert({
                  customer_id: customer.id,
                  command_name: command,
                  scheduled_at: new Date(),
                  created_at: new Date(),
                  updated_at: new Date()
                })
            })
          )
        }
      })

      return response.redirect().toRoute('customer.index')
    } catch (error) {
      return response.redirect().back()
    }
  }

  async storeCommand({ request, response }: HttpContext) {
  try {
    const data = request.only(['customer_id', 'command_name', 'scheduled_at'])

    await Command.create({
      customerId: data.customer_id,
      commandName: data.command_name,
      scheduledAt: DateTime.now()
    })

    return response.redirect().back()
  } catch (error) {
    console.error('COMMAND_STORE_ERROR:', error)
    return response.redirect().back()
  }
}


  async edit({ params, view }: HttpContext) {
    
    const customer = await Customer.query().where('id',params.id).preload('pledgeCards').preload('commands').firstOrFail()

    return view.render('pages/customers/edit', { customer })
  }


  async update({ params, request, response }: HttpContext) {
  try {
    const { pledgecards, commands, ...customerData } =
      await request.validateUsing(createCustomerValidator)

    const deleteIds = request.input('remove_image_ids', [])
    const deleteCommandIds = request.input('remove_command_ids', [])
    const existingCommands = request.input('existing_commands', {})

    const newFilePaths = (pledgecards && Array.isArray(pledgecards))
      ? await Promise.all(
          pledgecards.map(file => CustomerService.storePlegdeCard(file))
        )
      : []

    await db.transaction(async (trx) => {

      await CustomerService.update(
        params.id,
        customerData,
        newFilePaths,
        deleteIds,
        trx
      )

      for (const id in existingCommands) {
    const value = existingCommands[id].trim()

    if (value !== '') {
      await Command
        .query({ client: trx })
        .where('id', id)
        .update({
          command_name: value,
          updated_at: new Date()
        })
    }
  }

      if (deleteCommandIds.length) {
        await Command
          .query({ client: trx })
          .whereIn('id', deleteCommandIds)
          .delete()
      }

      const newCommands = (commands || [])
        .map(c => c.trim())
        .filter(c => c !== '')

      if (newCommands.length) {
        await Promise.all(
          newCommands.map(cmd => {
            return Command.create({
              customerId: params.id,   
              commandName: cmd,
              scheduledAt: DateTime.now()
            }, { client: trx })
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
