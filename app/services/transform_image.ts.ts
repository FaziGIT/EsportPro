import Tournament from '#models/tournament'
import Game from '#models/game'
import type { HttpContext } from '@adonisjs/core/http'

interface Model {
  model: Tournament | Game | null
  response: HttpContext['response']
}

export const Uint8ArrayToBuffer = ({ model, response }: Model) => {
  if (!model || !model.image) {
    return response.status(404).json({ error: 'Image not found' })
  }

  const buffer = Buffer.from(model.image)

  return response.send(buffer)
}
