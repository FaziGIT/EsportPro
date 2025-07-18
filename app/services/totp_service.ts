import { createHmac, randomBytes } from 'node:crypto'

export class TotpService {
  private static readonly WINDOW_SIZE = 1
  private static readonly TIME_STEP = 30
  private static readonly DIGITS = 6
  private static readonly SECRET_LENGTH = 20

  static generateSecret(): string {
    const buffer = randomBytes(this.SECRET_LENGTH)
    return this.base32Encode(buffer)
  }

  static generateRecoveryCodes(count: number = 8): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase()
      codes.push(code)
    }
    return codes
  }

  static generateTotpUri(secret: string, email: string, issuer: string = 'EsportPro'): string {
    const encodedIssuer = encodeURIComponent(issuer)
    const encodedEmail = encodeURIComponent(email)
    const encodedSecret = secret.replace(/=/g, '')

    return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${encodedSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${this.DIGITS}&period=${this.TIME_STEP}`
  }

  static generateCode(secret: string, time?: number): string {
    const currentTime = time || Date.now()
    const timeStep = Math.floor(currentTime / 1000 / this.TIME_STEP)
    const secretBuffer = this.base32Decode(secret)
    const timeBuffer = Buffer.alloc(8)

    timeBuffer.writeUInt32BE(Math.floor(timeStep / 0x100000000), 0)
    timeBuffer.writeUInt32BE(timeStep & 0xffffffff, 4)

    const hmac = createHmac('sha1', secretBuffer)
    hmac.update(timeBuffer)
    const hash = hmac.digest()

    const offset = hash[hash.length - 1] & 0x0f
    const code =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)

    return (code % Math.pow(10, this.DIGITS)).toString().padStart(this.DIGITS, '0')
  }

  static verifyCode(secret: string, code: string, time?: number): boolean {
    const currentTime = time || Date.now()

    for (let i = -this.WINDOW_SIZE; i <= this.WINDOW_SIZE; i++) {
      const timeWindow = currentTime + i * this.TIME_STEP * 1000
      const expectedCode = this.generateCode(secret, timeWindow)

      if (expectedCode === code) {
        return true
      }
    }

    return false
  }

  static verifyRecoveryCode(recoveryCodes: string[], code: string): boolean {
    return recoveryCodes.includes(code.toUpperCase())
  }

  static removeRecoveryCode(recoveryCodes: string[], code: string): string[] {
    return recoveryCodes.filter((c) => c !== code.toUpperCase())
  }

  static generateQrCodeDataUrl(text: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
  }

  private static base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = 0
    let value = 0
    let result = ''

    for (const byte of buffer) {
      value = (value << 8) | byte
      bits += 8

      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }

    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31]
    }

    while (result.length % 8 !== 0) {
      result += '='
    }

    return result
  }

  private static base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    const cleanedEncoded = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '')

    let bits = 0
    let value = 0
    let index = 0
    const output: number[] = []

    for (const char of cleanedEncoded) {
      const charIndex = alphabet.indexOf(char)

      if (charIndex === -1) continue

      value = (value << 5) | charIndex
      bits += 5

      if (bits >= 8) {
        output[index++] = (value >> (bits - 8)) & 255
        bits -= 8
      }
    }

    return Buffer.from(output)
  }
}
