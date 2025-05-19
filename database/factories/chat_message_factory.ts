import factory from '@adonisjs/lucid/factories'
import ChatMessage from '#models/chat_message'
import User from '#models/user'
import Channel from '#models/channel'

export const ChatMessageFactory = factory
  .define(ChatMessage, async ({ faker }) => {
    const users = await User.all()
    const channels = await Channel.all()
    const randomUserId = faker.helpers.arrayElement(users).id
    const randomChannelId = faker.helpers.arrayElement(channels).id

    return {
      content: faker.lorem.sentence(),
      userId: randomUserId,
      channelId: randomChannelId,
    }
  })
  .build()
