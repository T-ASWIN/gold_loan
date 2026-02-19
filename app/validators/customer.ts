// app/validators/customer.ts
import vine from '@vinejs/vine'

export const createCustomerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    email: vine.string().email().trim(),
    phoneNumber: vine.string().trim().optional(),
    address: vine.string().trim().optional(),
    pledgecard: vine.file({ extnames: ['jpg', 'png', 'jpeg'], size: '5mb' }).optional(),
    pledgeCardUrl: vine.string().optional(),
  })
)
