import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import Permission from '#models/permission'
import { updatePermissionsValidator } from '#validators/user'

export default class UsersController {
  async index({ view, auth }: HttpContext) {
    const user = await User.query()
  .where('id', auth.user!.id)
  .preload('role', (roleQuery) => {
    roleQuery.preload('permissions')
  })
  .firstOrFail()
    const permissions = user.role!.permissions.map((p) => p.name)

    const users = await User.query().preload('role')
    const roles = await Role.all()

    return view.render('pages/admin/index', { users, roles, permissions })
  }

  async create({ view }: HttpContext) {
    const roles = await Role.all()
    return view.render('pages/admin/create', { roles })
  }

  async store({ request, response }: HttpContext) {
    const { full_name, email, password, role_id } = request.only([
      'full_name',
      'email',
      'password',
      'role_id',
    ])

    await User.create({
      fullName: full_name,
      email,
      password,
      roleId: Number(role_id),
    })

    return response.redirect().toRoute('admin.users.index')
  }

  
  async edit({ view, params }: HttpContext) {
  const user = await User.findOrFail(params.id)



    return view.render('pages/admin/edit', {
      user,
    })
  }

  async update({ params, request, response }: HttpContext) {
  const user = await User.findOrFail(params.id)


    const { full_name, email } = request.only(['full_name', 'email' ])

    // Update user details
    user.fullName = full_name
    user.email = email
    await user.save()

    return response.redirect().toRoute('admin.users.index')
  }

  async editRoles({ view }: HttpContext) {
  const roles = await Role.query().preload('permissions')
  const permissions = await Permission.query().orderBy('id', 'asc')



  return view.render('pages/admin/edit_user_permissions', {
    roles,
    permissions,
  })
  }


  async updatePermissions({ request, response }: HttpContext) {
    
  const { permissions } = await request.validateUsing(updatePermissionsValidator)

  const roles = await Role.query()

  for (const role of roles) {
  const permissionIds = permissions?.[String(role.id)]

  if (permissionIds) {
    await role.related('permissions').sync(permissionIds)
  } else {
    await role.related('permissions').detach()
  }
}

  return response.redirect().toRoute('admin.users.index')
}
}
