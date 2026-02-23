import Permission from '#models/permission'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import {Permissions} from '#enums/permissions'
import Role from '#models/role'

export default class extends BaseSeeder {
  async run() {
    const permissions = await Permission.createMany([
      { name: Permissions.VIEW },
      { name: Permissions.EDIT },
      { name: Permissions.DELETE },
      { name: Permissions.CREATE },
      { name: Permissions.COMMENT },
    ])

    const view = permissions[0].id
    const edit = permissions[1].id
    const del = permissions[2].id
    const create = permissions[3].id
    const comment = permissions[4].id

    const operationHead = await Role.create({ name: 'operation Head' })
    await operationHead.related('permissions').attach([view, edit, del, create, comment])

    const operationManager = await Role.create({ name: 'Operation Manager' })
    await operationManager.related('permissions').attach([view, edit, create, comment])

    // Financial Head: View, Edit, and Comment
    const financialHead = await Role.create({ name: 'Financial Head' })
    await financialHead.related('permissions').attach([view, edit, comment])

    // Financial Manager: View and Comment only
    const financialManager = await Role.create({ name: 'Financial Manager' })
    await financialManager.related('permissions').attach([view, comment])
  }
}
