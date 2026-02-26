// app/validators/customer.ts
import vine from '@vinejs/vine'

export const createCustomerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    email: vine.string().email().trim(),
    phoneNumber: vine.string().trim().optional(),
    address: vine.string().trim().optional(),
    commend: vine.string().trim().minLength(1).optional(),
    pledgecards: vine
      .array(
        vine.file({
          size: '5mb',
          extnames: ['jpg', 'png', 'jpeg'],
        })
      )
      .optional(),
  })
)
