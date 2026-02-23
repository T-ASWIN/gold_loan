import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import Permission from '#models/permission'

export default class UsersController {

async index ({view,auth}:HttpContext){
    const user =auth.user!
    await user.load('role',(q) => q.preload('permissions'))
    const permissions = user.role?.permissions?.map((p) => p.name) ?? []

    const users = await User.query().preload('role')
    const roles = await Role.all()

    return view.render('pages/admin/edit_roles', {users, roles, permissions})

}


  async edit({ view, params }: HttpContext) {
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

  async editUser({ view, params }: HttpContext) {
  const editUser = await User.query()
    .where('id', params.id)
    .preload('role', (q) => q.preload('permissions'))
    .firstOrFail()

  const allRoles = await Role.query().preload('permissions')

  return view.render('pages/admin/edit_user', {
    editUser,
    allRoles,
  })
}

async updateUser({ params, request, response }: HttpContext) {
  const editUser = await User.query()
    .where('id', params.id)
    .preload('role')
    .firstOrFail()

  const { full_name, email, role_id } = request.only(['full_name', 'email', 'role_id'])

  // Update user details
  editUser.fullName = full_name
  editUser.email = email
  editUser.roleId = Number(role_id)
  await editUser.save()

  return response.redirect().toRoute('admin.users.index')
}

  async updatePermissions({ params, request, response }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('role')
      .firstOrFail()

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