import Permission from '#models/permission'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { Permissions } from '#enums/permissions'

export default class extends BaseSeeder {
  async run() {
    // 🔹 Create Permissions
    const permissions = await Permission.createMany([
      { name: Permissions.VIEW },
      { name: Permissions.MAKER },
    ])

    const view = permissions[0].id
    const maker = permissions[1].id

    // 🔹 Create Roles
    const operationHead = await Role.create({ name: 'Operation Head' })
    const operationManager = await Role.create({ name: 'Operation Manager' })
    const financialHead = await Role.create({ name: 'Financial Head' })
    const financialManager = await Role.create({ name: 'Financial Manager' })

    // 🔹 Assign Permissions

    // Full access
    await operationHead.related('permissions').attach([view, maker])
    await operationManager.related('permissions').attach([view, maker])

    // View only
    await financialHead.related('permissions').attach([view])
    await financialManager.related('permissions').attach([view])
  }
}