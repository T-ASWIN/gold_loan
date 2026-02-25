import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class PermissionsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, view } = ctx

    try {
      // silently check if user is logged in, don't throw if not
      await auth.check()

      if (auth.user) {
        await auth.user.load('role', (roleQuery) => {
          roleQuery.preload('permissions')
        })

        view.share({
          currentRole: auth.user.role?.name ?? null,
        })
      }
    } catch {}
    return next()
  }
}
