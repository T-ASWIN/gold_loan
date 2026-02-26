import vine from "@vinejs/vine";

export const updatePermissionsValidator = vine.compile(
  vine.object({
    permissions: vine
      .record(
        vine.union([
          vine.union.if(
            (value) => Array.isArray(value),
            vine.array(vine.number())
          ),
          vine.union.else(vine.number().transform(val => [val])),
        ])
      )
      .optional(),
  })
)