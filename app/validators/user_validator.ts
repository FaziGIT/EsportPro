import vine from '@vinejs/vine'

export const userProfileValidator = vine.compile(
  vine.object({
    firstName: vine
      .string()
      .minLength(2)
      .maxLength(50)
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/u)
      .optional()
      .nullable(),
    lastName: vine
      .string()
      .minLength(2)
      .maxLength(50)
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/u)
      .optional()
      .nullable(),
  })
)
