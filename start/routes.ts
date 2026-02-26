  const CustomersController = () => import('#controllers/customers_controller')
  import router from '@adonisjs/core/services/router'
  import { Permissions } from '#enums/permissions'
  import { middleware } from './kernel.js'
  const RegisterController = () => import('#controllers/auth/register_controller')
  const LoginController = () => import('#controllers/auth/login_controller')
  const LogoutController = () => import('#controllers/auth/logout_controller')
  const UsersController = () => import('#controllers/users_controller')
  router.on('/').redirect('/auth/login')

  router.on('/login').redirect('/auth/login')

  router
  .group(() => {
    router
      .get('/', [CustomersController, 'index'])
      .as('index')
      .use(middleware.roleUrlManager([Permissions.VIEW]))


    router
      .get('/new', [CustomersController, 'create'])
      .as('create')
      .use(middleware.roleUrlManager([Permissions.MAKER]))

    router
      .get('/:id', [CustomersController, 'show'])
      .as('show')
      .use(middleware.roleUrlManager([Permissions.VIEW]))


    router
      .post('/', [CustomersController, 'store'])
      .as('store')
      .use(middleware.roleUrlManager([Permissions.MAKER]))

    router
      .post('/commend', [CustomersController, 'storeCommend'])
      .as('commend')
      .use(middleware.roleUrlManager([Permissions.MAKER]))

    router
      .get('/:id/edit', [CustomersController, 'edit'])
      .as('edit')
      .use(middleware.roleUrlManager([Permissions.MAKER]))

    router
      .put('/:id', [CustomersController, 'update'])
      .as('update')
      .use(middleware.roleUrlManager([Permissions.MAKER]))

    router
      .delete('/:id', [CustomersController, 'destroy'])
      .as('destroy')
      .use(middleware.roleUrlManager([Permissions.MAKER]))
  })
  .prefix('customer')
  .as('customer')


  router
    .group(() => {
      router.get('/register', [RegisterController, 'show']).as('register.show')
      // .use(middleware.guest())

      router.post('/register', [RegisterController, 'store']).as('register.store')

      router.get('/login', [LoginController, 'show']).as('login.show')
      router.post('/login', [LoginController, 'store']).as('login.store')

      router.post('/logout', [LogoutController, 'handle']).as('logout')
    })
    .prefix('/auth')
    .as('auth')

 router
    .group(() => {
      router.get('/', [UsersController, 'index']).as('index')
      router.get('/create', [UsersController, 'create']).as('create')
      router.post('/', [UsersController, 'store']).as('store')
      router.get('/:id/edit', [UsersController, 'edit']).as('edit')
      router.put('/:id', [UsersController, 'update']).as('update')
      router.get('/permissions', [UsersController, 'editRoles']).as('editPermissions')
      router.post('/permissions', [UsersController, 'updatePermissions']).as('updatePermissions')
    })
    .prefix('/admin/users')
    .as('admin.users')
    .use(middleware.auth())