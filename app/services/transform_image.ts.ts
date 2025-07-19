import Tournament from '#models/tournament'
import Game from '#models/game'
import type { HttpContext } from '@adonisjs/core/http'
import { readFileSync } from 'node:fs'

interface Model {
  model: Tournament | Game | null
  response: HttpContext['response']
}

export const Uint8ArrayToBuffer = ({ model, response }: Model) => {
  if (!model || !model.image) {
    return response.status(404).json({ error: 'Image not found' })
  }

  const buffer = Buffer.from(model.image)
  const mimeType = detectMimeType(model.image)

  response.header('Content-Type', mimeType || 'application/octet-stream')
  return response.send(buffer)
}

export const BufferToUint8Array = (buffer: string): Uint8Array => {
  const imageBuffer = readFileSync(buffer)
  return new Uint8Array(imageBuffer)
}

function detectMimeType(data: Uint8Array): string | null {
  if (data.length < 8) return null

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  ) {
    return 'image/png'
  }

  // JPEG/JPG: FF D8 FF
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return 'image/jpeg'
  }

  return null
}
