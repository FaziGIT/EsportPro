import vine from '@vinejs/vine'

/**
 * Règle personnalisée autorisant uniquement lettres, chiffres, espaces et tirets
 */
export const nameRule = vine.createRule((value, _, field) => {
  if (typeof value !== 'string') return

  const validNameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/u
  if (!validNameRegex.test(value)) {
    field.report(
      'Le champ {{field}} ne doit contenir que des lettres, des espaces et des tirets (-)',
      'invalid_name_format',
      field
    )
  }
})

export const userProfileValidator = vine.compile(
  vine.object({
    firstName: vine.string().minLength(2).maxLength(50).use(nameRule()),
    lastName: vine.string().minLength(2).maxLength(50).use(nameRule()),
  })
)
