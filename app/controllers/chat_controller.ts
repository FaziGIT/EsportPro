import { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'
import { ChatMessage } from '#types/chat'
import User from '#models/user'
import Channel from '#models/channel'
import ChatMessageModel from '#models/chat_message'
import { ChannelEntityType } from '#enums/channel_entity_type'

export default class ChatsController {
  private async checkChannelAccess(channelId: string, user: User): Promise<Channel> {
    const channel = await Channel.findOrFail(channelId)

    // Check permissions based on channel type
    let hasAccess = false

    if (channel.entityType === ChannelEntityType.Team && channel.teamId) {
      // Check if user is part of the team
      const userTeams = await user.related('teams').query().where('teams.id', channel.teamId)
      hasAccess = userTeams.length > 0
    } else if (channel.entityType === ChannelEntityType.Tournament && channel.tournamentId) {
      // Check if user participates in the tournament (through their teams)
      const userInTournament = await user
        .related('teams')
        .query()
        .where('teams.tournament_id', channel.tournamentId)
      hasAccess = userInTournament.length > 0
    }

    if (!hasAccess) {
      throw new Error('Access denied to this channel')
    }

    return channel
  }

  private async getFormattedMessages(
    channelId: string,
    user: User,
    offset: number = 0,
    limit: number = 20
  ) {
    const messages = await ChatMessageModel.query()
      .where('channelId', channelId)
      .preload('user')
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit)

    // Format messages for frontend
    return messages.reverse().map((msg) => ({
      text: msg.content,
      sender: msg.user.pseudo === user.pseudo ? 'user' : 'other',
      time: msg.createdAt.toFormat('H:mm'),
      pseudo: msg.user.pseudo || msg.user.email,
      channel: channelId,
    }))
  }

  private async processChannelWithMessages(
    channel: Channel,
    displayName: string,
    user: User,
    channelsMap: Map<string, any>
  ) {
    if (!channel || channelsMap.has(channel.id)) {
      return
    }

    // Use utility function to get and format messages
    const formattedMessages = await this.getFormattedMessages(channel.id, user, 0, 20)

    channelsMap.set(channel.id, {
      ...channel.toJSON(),
      displayName,
      messages: formattedMessages,
      lastMessage:
        formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1].text : '',
    })
  }

  async getUserChannelsWithMessages({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    // Get user with their relations
    const userWithRelations = await User.query()
      .where('id', user.id)
      .preload('teams', (teamQuery) => {
        teamQuery.preload('tournament')
      })
      .firstOrFail()

    // Use a Map to avoid duplicates
    const channelsMap = new Map()

    // Process channels for teams and tournaments
    for (const team of userWithRelations.teams) {
      // 1. Team channel
      const teamChannel = await Channel.query()
        .where('entityType', ChannelEntityType.Team)
        .where('teamId', team.id)
        .first()

      if (teamChannel) {
        await this.processChannelWithMessages(teamChannel, `Team: ${team.name}`, user, channelsMap)
      }

      // 2. Tournament channel for the team
      if (team.tournament) {
        const tournamentChannel = await Channel.query()
          .where('entityType', ChannelEntityType.Tournament)
          .where('tournamentId', team.tournament.id)
          .first()

        if (tournamentChannel) {
          await this.processChannelWithMessages(
            tournamentChannel,
            `Tournament: ${team.tournament.name}`,
            user,
            channelsMap
          )
        }
      }
    }

    const uniqueChannels = Array.from(channelsMap.values())

    return response.ok({ channels: uniqueChannels })
  }

  async message({ request, response, auth }: HttpContext) {
    const { channelId, message } = request.only(['channelId', 'message'])
    const user = auth.user

    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    if (!channelId || !message) {
      return response.badRequest('Channel ID and message are required')
    }

    try {
      // Check that user has access to this channel
      await this.checkChannelAccess(channelId, user)
    } catch (error) {
      return response.forbidden('Access denied to this channel')
    }

    // Save message to database
    const chatMessage = await ChatMessageModel.create({
      content: message,
      userId: user.id,
      channelId: channelId,
    })

    // Load user for the message
    await chatMessage.load('user')

    const messagePayload: ChatMessage = {
      time: chatMessage.createdAt.toFormat('H:mm'),
      pseudo: user.pseudo || user.email,
      text: message,
      channel: channelId,
    }

    // Broadcast message to specific channel
    transmit.broadcast(`chat/${channelId}`, messagePayload as any)

    return response.ok({ success: true })
  }

  async getOldMessages({ request, response, auth }: HttpContext) {
    const { channelId, offset = 0, limit = 10 } = request.only(['channelId', 'offset', 'limit'])
    const user = auth.user

    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    if (!channelId) {
      return response.badRequest('Channel ID is required')
    }

    try {
      // Check that user has access to this channel
      await this.checkChannelAccess(channelId, user)
    } catch (error) {
      return response.forbidden('Access denied to this channel')
    }

    // Use utility function to get and format messages
    const formattedMessages = await this.getFormattedMessages(
      channelId,
      user,
      Number.parseInt(offset),
      Number.parseInt(limit)
    )

    // Check if there are more older messages
    const totalMessages = await ChatMessageModel.query()
      .where('channelId', channelId)
      .count('* as total')

    const hasMore =
      Number.parseInt(offset) + Number.parseInt(limit) <
      Number.parseInt(totalMessages[0].$extras.total)

    return response.ok({
      messages: formattedMessages,
      hasMore,
      total: Number.parseInt(totalMessages[0].$extras.total),
    })
  }
}
