import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    emailPseudo: vine.string(), // not email only, can be a pseudo too
    password: vine.string(),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    pseudo: vine.string().minLength(3).unique({ table: 'users', column: 'pseudo' }),
    email: vine.string().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(8),
  })
)
