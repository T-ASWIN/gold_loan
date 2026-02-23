import User from '#models/user'
import { loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async show({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  async store({ request, response, auth }: HttpContext) {
    //validate and grab
    const { email, password } = await request.validateUsing(loginValidator)
    //2.verify the user
    const user = await User.verifyCredentials(email, password)
    //login
    await auth.use('web').login(user)
    //return
    return response.redirect().toRoute('customer.index')
  }
}
