import vine from '@vinejs/vine'

/**
 * Validator pour la demande de reset password
 */
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

/**
 * Validator pour la réinitialisation du mot de passe
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine
      .string()
      .minLength(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/), // At least 8 characters, one uppercase, one lowercase, one number, one special character
    password_confirmation: vine
      .string()
      .minLength(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .sameAs('password'),
  })
)
