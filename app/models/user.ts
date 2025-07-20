import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Game from './game.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Team from './team.js'
import ChatMessage from './chat_message.js'
import { UserRole } from '#enums/user_role'
import { TotpService } from '#services/totp_service'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'pseudo'], // Fields to use for authentication
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare pseudo: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isPrivate: boolean

  @column({ columnName: 'is_2fa_enabled' })
  declare is2faEnabled: boolean

  @column({ serializeAs: null })
  declare twofaSecret: string | null

  @column({ serializeAs: null })
  declare twofaRecoveryCodes: string | null

  @column.dateTime()
  declare twofaConfirmedAt: DateTime | null

  @manyToMany(() => Game, {
    pivotTable: 'bookmarks',
    pivotTimestamps: { createdAt: true, updatedAt: false },
  })
  declare favoriteGames: ManyToMany<typeof Game>

  @manyToMany(() => Game, {
    pivotTable: 'user_game_infos',
    pivotColumns: ['elo', 'pseudo', 'region'],
    pivotTimestamps: true,
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'game_id',
  })
  declare gameInfos: ManyToMany<typeof Game>

  @manyToMany(() => Team, {
    pivotTable: 'user_teams',
    pivotTimestamps: true,
  })
  declare teams: ManyToMany<typeof Team>

  @hasMany(() => ChatMessage)
  declare messages: HasMany<typeof ChatMessage>

  @column()
  declare role: UserRole

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // 2FA Methods

  /**
   * Generate and set up 2FA secret
   */
  public async setupTwoFa(): Promise<{
    secret: string
    qrCodeUrl: string
    recoveryCodes: string[]
  }> {
    const secret = TotpService.generateSecret()
    const recoveryCodes = TotpService.generateRecoveryCodes()

    this.twofaSecret = secret
    this.twofaRecoveryCodes = JSON.stringify(recoveryCodes)

    await this.save()

    const totpUri = TotpService.generateTotpUri(secret, this.email)
    const qrCodeUrl = TotpService.generateQrCodeDataUrl(totpUri)

    return {
      secret,
      qrCodeUrl,
      recoveryCodes,
    }
  }

  /**
   * Confirm 2FA setup
   */
  public async confirmTwoFa(code: string): Promise<boolean> {
    if (!this.twofaSecret) {
      return false
    }

    const isValid = TotpService.verifyCode(this.twofaSecret, code)

    if (isValid) {
      this.is2faEnabled = true
      this.twofaConfirmedAt = DateTime.now()
      await this.save()
      return true
    }

    return false
  }

  /**
   * Verify 2FA code
   */
  public verifyTwoFaCode(code: string): boolean {
    if (!this.twofaSecret || !this.is2faEnabled) {
      return false
    }

    return TotpService.verifyCode(this.twofaSecret, code)
  }

  /**
   * Verify recovery code
   */
  public async verifyRecoveryCode(code: string): Promise<boolean> {
    if (!this.twofaRecoveryCodes || !this.is2faEnabled) {
      return false
    }

    const recoveryCodes = JSON.parse(this.twofaRecoveryCodes)
    const isValid = TotpService.verifyRecoveryCode(recoveryCodes, code)

    if (isValid) {
      // Remove used recovery code
      const updatedCodes = TotpService.removeRecoveryCode(recoveryCodes, code)
      this.twofaRecoveryCodes = JSON.stringify(updatedCodes)
      await this.save()
      return true
    }

    return false
  }

  /**
   * Disable 2FA
   */
  public async disableTwoFa(): Promise<void> {
    this.is2faEnabled = false
    this.twofaSecret = null
    this.twofaRecoveryCodes = null
    this.twofaConfirmedAt = null
    await this.save()
  }

  /**
   * Get remaining recovery codes count
   */
  public getRecoveryCodesCount(): number {
    if (!this.twofaRecoveryCodes) {
      return 0
    }

    try {
      const codes = JSON.parse(this.twofaRecoveryCodes)
      return codes.length
    } catch {
      return 0
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  public get hasTwoFaEnabled(): boolean {
    return this.is2faEnabled && !!this.twofaSecret && !!this.twofaConfirmedAt
  }
}
