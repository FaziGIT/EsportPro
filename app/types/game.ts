import { GamePlatform } from '#enums/game_platform'

export interface GameFormData {
  name: string
  platform: GamePlatform
  image: File | null
  imagePreview?: string

  [key: string]: any
}
