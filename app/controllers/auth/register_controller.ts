import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { registerValidator } from '#validators/auth'

export default class RegisterController {
  async show({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async store({ response, request, params, auth }: HttpContext) {
    //1.request data and validate it
    const data = await request.validateUsing(registerValidator)
    //2.create our user
    const user = await User.create({
      ...data,
      roleId: 4, // Hardcode the default role ID here
    })
    //3.create profile for user
    //3.login that user
    await auth.use('web').login(user)
    console.log('User logged in:', auth.use('web').isAuthenticated)
    //4.return the user back to home
    return response.redirect().toRoute('customer.index')
  }
}
