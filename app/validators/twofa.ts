import vine from '@vinejs/vine'

export const twofaValidator = vine.compile(
  vine.object({
    code: vine.string().minLength(6).maxLength(8),
  })
)
