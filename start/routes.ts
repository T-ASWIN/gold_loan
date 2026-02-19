const CustomersController = () => import('#controllers/customers_controller')
import router from '@adonisjs/core/services/router'
router.on('/').redirect('/customer')

router
  .group(() => {
    router.get('/', [CustomersController, 'index']).as('index')
    router.get('/new', [CustomersController, 'create']).as('create')
    router.post('/', [CustomersController, 'store']).as('store')
    router.get('/:id/edit', [CustomersController, 'edit']).as('edit')
    router.put('/:id', [CustomersController, 'update']).as('update')
    router.delete('/:id', [CustomersController, 'destroy']).as('destroy')
  })
  .prefix('customer')
  .as('customer')
