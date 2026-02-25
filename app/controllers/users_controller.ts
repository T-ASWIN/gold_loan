import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import Permission from '#models/permission'

export default class UsersController {
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    await user.load('role', (q) => q.preload('permissions'))
    const permissions = user.role?.permissions?.map((p) => p.name) ?? []

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

  async editRoles({ view, params }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('role', (q) => q.preload('permissions'))
      .firstOrFail()

    const allPermissions = await Permission.all()
    const userPermissions = user.role?.permissions?.map((p) => p.id) ?? []

    return view.render('pages/admin/edit_user_permissions', {
      editUser: user,
      allPermissions,
      userPermissions,
    })
  }


  async updatePermissions({ params, request, response }: HttpContext) {
    const user = await User.query().where('id', params.id).preload('role').firstOrFail()

    const { permission_ids } = request.only(['permission_ids'])

    // permission_ids comes as array of strings, convert to numbers
    const ids: number[] = permission_ids
      ? (Array.isArray(permission_ids) ? permission_ids : [permission_ids]).map(Number)
      : []

    // sync replaces all existing permissions for this role
    await user.role.related('permissions').sync(ids)

    return response.redirect().toRoute('admin.users.index')
  }
}
