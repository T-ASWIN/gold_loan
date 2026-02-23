import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleUrlManagerMiddleware {
  public async handle(ctx: HttpContext, next: NextFn, options: string[]) {
    const { auth, response } = ctx

    // Get permissions from the user (already loaded by the global middleware)
    if (!auth.user) return response.unauthorized()

    if (!auth.user.role?.permissions) {
      await auth.user.load('role', (r) => r.preload('permissions'))
    }

    const permissions = auth.user.role?.permissions.map((p) => p.name) || []

    console.log('REQUIRED:', options)
    console.log('USER HAS:', permissions)

    const hasPermission = options.some((p) => permissions.includes(p))

    if (!hasPermission) {
      return response.forbidden('You are not authorized to access this resource.')
    }

    return next()
  }
}
