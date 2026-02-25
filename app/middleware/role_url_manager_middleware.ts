import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleUrlManagerMiddleware {
  public async handle(ctx: HttpContext, next: NextFn, options: string[]) {
    const { auth, response } = ctx

    // ✅ redirect to login instead of returning 401
    if (!auth.user) {
      return response.redirect().toRoute('auth.login.show')
    }

    if (!auth.user.role?.permissions) {
      await auth.user.load('role', (r) => r.preload('permissions'))
    }

    const permissions = auth.user.role?.permissions?.map((p) => p.name) || []

    console.log('REQUIRED:', options)
    console.log('USER HAS:', permissions)

    const hasPermission = options.some((p) => permissions.includes(p))

    if (!hasPermission) {
      // ✅ redirect back instead of forbidden response
      return response.redirect().back()
    }

    return next()
  }
}