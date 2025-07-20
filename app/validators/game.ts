import vine from '@vinejs/vine'
import { GamePlatform } from '#enums/game_platform'
import Game from '#models/game'

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

export const gameUpdateValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(2)
      .maxLength(50)
      .unique(async (db, value, field) => {
        const game: Game = await db
          .from('games')
          .whereNot('id', field.data.params.id)
          .where('name', value)
          .first()
        return !game
      }),
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
