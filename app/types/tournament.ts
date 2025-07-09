import { TierType } from '#enums/tier_type'
import { FormatType } from '#enums/format_type'
import { DateTime } from 'luxon'

export interface TournamentFormData {
  name: string
  tier: TierType
  format: FormatType
  price: number
  rules: string
  numberParticipants: number
  numberPlayersPerTeam: number | null
  region: string | null
  address: string | null
  city: string | null
  country: string | null
  postalCode: string | null
  startDate: DateTime | null
  endDate: DateTime | null
  gameId: string
  isOnline: boolean
  teamMode: boolean
  image: File | null
  imagePreview?: string

  [key: string]: any
}
