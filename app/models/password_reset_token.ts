import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import { randomBytes } from 'node:crypto'

export default class PasswordResetToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare token: string

  @column.dateTime()
  declare expiresAt: DateTime

  @column()
  declare used: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Generate a new reset password token for a user
   */
  static async generateForUser(
    user: User,
    expirationHours: number = 1
  ): Promise<PasswordResetToken> {
    // Invalidate all existing tokens for this user
    await this.query().where('user_id', user.id).where('used', false).update({ used: true })

    // Generate a secure token
    const token = randomBytes(32).toString('hex')

    // Create the new token
    return await this.create({
      userId: user.id,
      token,
      expiresAt: DateTime.now().plus({ hours: expirationHours }),
      used: false,
    })
  }

  /**
   * Validate a token and return the user if valid
   */
  static async validateToken(token: string): Promise<User | null> {
    const resetToken = await this.query()
      .where('token', token)
      .where('used', false)
      .where('expires_at', '>', DateTime.now().toSQL())
      .preload('user')
      .first()

    if (!resetToken) {
      return null
    }

    return resetToken.user
  }

  /**
   * Mark a token as used
   */
  static async markAsUsed(token: string): Promise<boolean> {
    const result = await this.query()
      .where('token', token)
      .where('used', false)
      .update({ used: true })

    return result.length > 0
  }

  /**
   * Return the last unused token created less than minIntervalSeconds seconds ago
   */
  static async getRecentUnusedToken(
    user: User,
    minIntervalSeconds: number = 60
  ): Promise<PasswordResetToken | null> {
    const now = DateTime.now()
    const minDate = now.minus({ seconds: minIntervalSeconds })
    return await this.query()
      .where('user_id', user.id)
      .where('used', false)
      .where('created_at', '>', minDate.toSQL())
      .orderBy('created_at', 'desc')
      .first()
  }
}
