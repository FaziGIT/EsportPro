import vine from '@vinejs/vine'
import { GamePlatform } from '#enums/game_platform'

export const gameValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50).unique({ table: 'games', column: 'name' }),
    platform: vine.enum(GamePlatform),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })
      .optional(),
    imagePreview: vine.string().optional(),
  })
)
