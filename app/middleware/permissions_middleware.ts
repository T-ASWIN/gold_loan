import { HttpContext } from "@adonisjs/core/http"
import { NextFn } from "@adonisjs/core/types/http"

export default class PermissionsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, request } = ctx

    try {
      await auth.check()

      if (auth.user) {
        await auth.user.load('role', (roleQuery) => {
          roleQuery.preload('permissions')
        })
        console.log('PERMISSIONS LOADED FOR:', auth.user.email) // 👈 add this
      } else {
        console.log('NO AUTH USER on route:', request.url()) 
      }
    } catch (e) {
      console.log('PERMISSIONS MIDDLEWARE ERROR:', e.message) // 👈 and this
    }

    return next()
  }
}