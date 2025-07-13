import vine from '@vinejs/vine'
import { FormatType } from '#enums/format_type'
import { TierType } from '#enums/tier_type'

export const tournamentValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(100),
    tier: vine.enum(TierType),
    format: vine.enum(FormatType),
    price: vine.number().min(0),
    rules: vine.string().minLength(10),
    numberParticipants: vine.number().min(2).max(128),
    numberPlayersPerTeam: vine
      .number()
      .min(1)
      .max(10)
      .optional()
      .requiredWhen('teamMode', '=', '1'),
    teamMode: vine.boolean(),
    isOnline: vine.boolean(),
    region: vine.string().minLength(1).optional().requiredWhen('isOnline', '=', '0'), // false dont work, only 0 work
    address: vine.string().minLength(1).optional().requiredWhen('isOnline', '=', '0'),
    city: vine.string().minLength(1).optional().requiredWhen('isOnline', '=', '0'),
    country: vine.string().minLength(1).optional().requiredWhen('isOnline', '=', '0'),
    postalCode: vine.string().minLength(1).optional().requiredWhen('isOnline', '=', '0'),
    startDate: vine.date({ formats: { utc: true } }).afterOrSameAs('today'),
    endDate: vine.date({ formats: { utc: true } }).afterOrSameAs('startDate'),
    gameId: vine.string().exists({ table: 'games', column: 'id' }),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })
      .optional(),
    imagePreview: vine.string().optional(),
  })
)
