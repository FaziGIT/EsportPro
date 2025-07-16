<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useChatStore } from '~/store/chat_store'
import { transmit } from '#services/transmit'
import { useAuth } from '../../../resources/js/composables/useAuth'
import { getCsrfToken } from '~/utils'
import { Subscription } from '@adonisjs/transmit-client'
import { Chat, ChatMessage, FromWho, UserChannel } from '#types/chat'
import { useI18n } from '../../../resources/js/composables/useI18n'

const { t } = useI18n()
const { user } = useAuth()

const chatStore = useChatStore()
const messageText = ref('')
const messageContainer = ref<HTMLElement | null>(null)
const isConnecting = ref(false)
const unreadCount = ref(0)
const isTransitioning = ref(false)
const seenChats = ref<Set<string>>(new Set())
const subscriptions = new Map<string, Subscription>()
const userChannels = ref<UserChannel[]>([])
const isLoadingInitialMessages = ref(true)

// For sidebar menu and conversations
const activeChat = ref(0)
const chatList = ref<Chat[]>([])

// Variables for infinite scrolling
const isLoadingOldMessages = ref(false)
const messagesOffset = ref<Map<string, number>>(new Map())
const hasMoreMessages = ref<Map<string, boolean>>(new Map())

// Messages from the active conversation
const currentMessages = computed(() => {
  return chatList.value[activeChat.value]?.messages || []
})

// Get user channels
const fetchUserChannels = async () => {
  // Enable loading state
  isLoadingInitialMessages.value = true

  // Save scroll position and active chat index before loading
  const savedScrollPosition = chatStore.scrollPosition || 0
  const savedActiveChat = chatStore.activeChat || 0

  try {
    const response = await fetch('/chat/channels', {
      method: 'GET',
      headers: {
        'X-CSRF-TOKEN': getCsrfToken(),
      },
    })

    if (response.ok) {
      const data: { channels: UserChannel[] } = await response.json()
      userChannels.value = data.channels

      // Initialize chat list with retrieved channels and messages
      chatList.value = userChannels.value.map(
        (channel: UserChannel): Chat => ({
          id: channel.id,
          name: channel.displayName,
          lastMessage: channel.lastMessage,
          unread: 0,
          messages: channel.messages,
        })
      )

      // Initialize infinite scrolling variables for each channel
      userChannels.value.forEach((channel) => {
        messagesOffset.value.set(channel.id, 20) // We already loaded the first 20
        hasMoreMessages.value.set(channel.id, true) // By default, assume there are more
      })

      // Restore active chat if within valid bounds
      if (savedActiveChat >= 0 && savedActiveChat < chatList.value.length) {
        activeChat.value = savedActiveChat
      }
    } else {
      console.error('Error retrieving channels:', response.statusText)
    }
  } catch (error) {
    console.error('Error retrieving channels:', error)
  } finally {
    // Disable loading state after a small delay to avoid loader flash
    setTimeout(() => {
      isLoadingInitialMessages.value = false

      // Wait for DOM update to restore scroll position
      nextTick(() => {
        if (messageContainer.value) {
          if (savedScrollPosition > 0) {
            messageContainer.value.scrollTop = savedScrollPosition
          } else {
            // If no position is saved, scroll to bottom by default
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight
          }
        }
      })
    }, 300)
  }
}

// Setup subscriptions for all channels
const setupSubscriptions = async () => {
  try {
    for (const channel of userChannels.value) {
      try {
        // Check if we already have a subscription for this channel and clean it up first
        const existingSubscription = subscriptions.get(channel.id)
        if (existingSubscription) {
          try {
            await existingSubscription.delete()
          } catch (error) {
            console.warn(`Failed to cleanup existing subscription for ${channel.id}:`, error)
          }
          subscriptions.delete(channel.id)
        }

        const subscription = transmit.subscription(`chat/${channel.id}`)
        await subscription.create()

        // Configure listener for this channel
        subscription.onMessage((data: ChatMessage) => {
          // Identify if the message comes from current user or another user
          const fromWho: FromWho.user | FromWho.other =
            user.value?.pseudo === data.pseudo ? FromWho.user : FromWho.other

          // Format message differently based on sender
          const formattedMessage: ChatMessage = {
            text: data.text,
            sender: fromWho,
            time: data.time,
            pseudo: data.pseudo,
            channel: data.channel,
          }

          // Find the corresponding chat index
          const chatIndex = chatList.value.findIndex((chat) => chat.id === channel.id)
          if (chatIndex !== -1) {
            // Check for duplicate messages using text + time + pseudo as unique identifier
            const messageSignature = `${data.text}-${data.time}-${data.pseudo}`
            const existingMessages = chatList.value[chatIndex].messages
            const isDuplicate = existingMessages.some(
              (msg) => `${msg.text}-${msg.time}-${msg.pseudo}` === messageSignature
            )

            if (!isDuplicate) {
              // Add message to corresponding chat
              chatList.value[chatIndex].messages.push(formattedMessage)

              // Update last message
              chatList.value[chatIndex].lastMessage = data.text

              // If chat is not open or if it's not the active conversation,
              // increment unread message counter
              if (!chatStore.isChatOpen || activeChat.value !== chatIndex) {
                chatList.value[chatIndex].unread += 1
                updateTotalUnreadCount()
              }

              // Scroll to bottom if it's the active conversation
              if (activeChat.value === chatIndex) {
                nextTick(() => scrollToBottom())
              }
            }
          }
        })

        // Store subscription reference
        subscriptions.set(channel.id, subscription)
      } catch (error) {
        console.error(`Error creating subscription for ${channel.displayName}:`, error)
      }
    }
  } catch (error) {
    console.error('Error setting up subscriptions:', error)
  }
}

// Clean up all subscriptions (like cleanup of useEffect in React)
const cleanupSubscriptions = async () => {
  // Iterate through all subscriptions and delete them
  for (const [channelId, subscription] of subscriptions) {
    if (subscription && typeof subscription.delete === 'function') {
      try {
        await subscription.delete()
      } catch (error: any) {
        console.error(`Failed to delete subscription for ${channelId}:`, error.message)
      }
    }
  }

  // Clear the subscriptions Map
  subscriptions.clear()
}

// Select a conversation
const selectChat = (index: number) => {
  // Remember that this conversation has been seen
  seenChats.value.add(chatList.value[index].id)

  // Reset unread message counter for this conversation
  chatList.value[index].unread = 0
  // Update active conversation
  activeChat.value = index
  // Update global counter
  updateTotalUnreadCount()
  // Scroll to bottom to see latest messages
  nextTick(() => scrollToBottom())
}

const saveScrollPosition = () => {
  if (messageContainer.value) {
    // Save scroll position
    chatStore.scrollPosition = messageContainer.value.scrollTop

    // Save active chat index
    chatStore.activeChat = activeChat.value
  }
}

// Fix TypeScript errors by properly defining the type
const scrollToBottom = async (forceBottom = false) => {
  await nextTick()
  if (messageContainer.value) {
    const element = messageContainer.value

    // If we force scrolling to bottom or if no position is saved
    if (forceBottom || chatStore.scrollPosition === 0) {
      element.scrollTop = element.scrollHeight
    } else {
      // Otherwise restore previous position
      element.scrollTop = chatStore.scrollPosition
      // Reset for next uses
      chatStore.scrollPosition = 0
    }
  }
}

// Function to toggle chat and update notifications
const toggleChat = () => {
  if (!chatStore.isChatOpen && chatList.value.length > 0) {
    // Before opening chat, we register the active conversation ID
    seenChats.value.add(chatList.value[activeChat.value].id)

    // Reset unread counter for the active chat when opening
    if (activeChat.value >= 0 && activeChat.value < chatList.value.length) {
      chatList.value[activeChat.value].unread = 0
      updateTotalUnreadCount()
    }
  }

  chatStore.toggleChat()

  // If chat just opened and there are messages, scroll to bottom
  if (chatStore.isChatOpen && chatList.value.length > 0 && currentMessages.value.length > 0) {
    nextTick(() => scrollToBottom())
  }
}

// Update total unread message counter
const updateTotalUnreadCount = () => {
  unreadCount.value = chatList.value.reduce((total, chat) => total + chat.unread, 0)
}

// Watch for channel refresh trigger
watch(
  () => chatStore.refreshChannels,
  async (newValue, oldValue) => {
    if (newValue > oldValue) {
      // Clean up existing subscriptions before refreshing
      await cleanupSubscriptions()
      // Refresh channels and setup new subscriptions
      await fetchUserChannels()
      await setupSubscriptions()
    }
  }
)

onMounted(async () => {
  await fetchUserChannels()
  await setupSubscriptions()

  // Add listeners for Inertia events
  document.addEventListener('inertia:before', saveScrollPosition)
})

// Alternative avec onUnmounted (commented as less safe for this case)
onUnmounted(async () => {
  await cleanupSubscriptions()
})

// Function to load old messages
const loadOldMessages = async (channelId: string) => {
  if (isLoadingOldMessages.value || !hasMoreMessages.value.get(channelId)) {
    return
  }

  isLoadingOldMessages.value = true
  const offset = messagesOffset.value.get(channelId) || 0

  try {
    const response = await fetch(
      `/chat/messages/old?channelId=${channelId}&offset=${offset}&limit=10`,
      {
        method: 'GET',
        headers: {
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      }
    )

    if (response.ok) {
      const data: { messages: ChatMessage[]; hasMore: boolean } = await response.json()
      const chatIndex = chatList.value.findIndex((chat) => chat.id === channelId)

      if (chatIndex !== -1 && data.messages.length > 0) {
        // Save current scroll position
        const container = messageContainer.value
        const oldScrollHeight = container?.scrollHeight || 0

        // Add old messages to the beginning of the list
        chatList.value[chatIndex].messages.unshift(...data.messages)

        // Update offset
        messagesOffset.value.set(channelId, offset + data.messages.length)

        // Update hasMore
        hasMoreMessages.value.set(channelId, data.hasMore)

        // Restore scroll position after adding messages
        await nextTick()
        if (container) {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - oldScrollHeight
        }
      } else {
        // No more messages to load
        hasMoreMessages.value.set(channelId, false)
      }
    }
  } catch (error) {
    console.error('Error loading old messages:', error)
  } finally {
    isLoadingOldMessages.value = false
  }
}

// Scroll detection for infinite scrolling
const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement

  // If we are close to the top (less than 50px)
  if (container.scrollTop < 50 && !isLoadingOldMessages.value) {
    const currentChannelId = chatList.value[activeChat.value]?.id
    if (currentChannelId && hasMoreMessages.value.get(currentChannelId)) {
      loadOldMessages(currentChannelId)
    }
  }
}

// Function to send a message
const sendMessage = async (e: Event) => {
  e.preventDefault()
  if (!messageText.value.trim() || chatList.value.length === 0) return

  try {
    const currentChannelId = chatList.value[activeChat.value].id

    const values = new FormData()
    values.append('message', messageText.value)
    values.append('channelId', currentChannelId)

    const response = await fetch(`/chat/all/message`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: values,
    })

    messageText.value = ''
    if (!response.ok) {
      console.error('Error sending message:', response.statusText)
    }
  } catch (error: unknown) {
    console.error('Error sending message:', error instanceof Error ? error.message : String(error))
  }
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-10">
    <button
      @click="toggleChat"
      class="h-14 w-14 rounded-full bg-[#D6B7B0] hover:bg-[#e6c5be] flex items-center justify-center shadow-lg transition-all duration-300 relative cursor-pointer"
    >
      <span v-if="!chatStore.isChatOpen" class="text-white text-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </span>
      <span v-else class="text-white text-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
      <!-- Notification badge -->
      <div
        v-if="unreadCount > 0 && !chatStore.isChatOpen"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 min-w-[1.5rem] flex items-center justify-center px-1"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </div>
    </button>
  </div>

  <div
    class="fixed bottom-24 right-5 z-10 transform origin-bottom-right transition-all duration-300 ease-in-out"
    :class="{
      'scale-100 opacity-100 visible': chatStore.isChatOpen,
      'scale-0 opacity-0 invisible': !chatStore.isChatOpen,
    }"
  >
    <div
      v-if="chatStore.isChatOpen || isTransitioning"
      class="bg-white rounded-lg shadow-xl w-96 h-96 flex flex-col"
    >
      <div class="bg-[#B8938A] text-white p-3 rounded-t-lg flex justify-between items-center">
        <div class="flex items-center">
          <span class="font-semibold">{{ t('chat.onlineChat') }}</span>
          <span v-if="isConnecting" class="ml-2 animate-pulse">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                stroke-width="4"
                stroke-dasharray="30 30"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  dur="1s"
                  from="0 12 12"
                  to="360 12 12"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </span>
        </div>
        <button @click="chatStore.toggleChat" class="text-white cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Conversations sidebar menu -->
        <div class="w-1/3 border-r border-r-gray-300 overflow-y-auto bg-gray-50">
          <div class="p-2">
            <div class="text-sm font-medium text-gray-500 mb-2 px-2">{{ t('chat.chats') }}</div>

            <div v-if="chatList.length === 0" class="text-center text-gray-500 text-sm p-4">
              {{ t('chat.noChannelsAvailable') }}
            </div>

            <div
              v-for="(chat, index) in chatList"
              :key="chat.id"
              @click="selectChat(index)"
              class="p-2 rounded-md cursor-pointer flex items-center relative"
              :class="activeChat === index ? 'bg-[#f2e6e4]' : 'hover:bg-gray-100'"
            >
              <div
                class="w-8 h-8 rounded-full bg-[#D6B7B0] flex items-center justify-center text-white mr-2"
              >
                {{ chat.name.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate">{{ chat.name }}</div>
                <div class="text-xs text-gray-500 truncate">
                  {{ chat.lastMessage || t('chat.noMessages') }}
                </div>
              </div>
              <div
                v-if="chat.unread > 0"
                class="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 min-w-[1.25rem] flex items-center justify-center px-1"
              >
                {{ chat.unread }}
              </div>
            </div>
          </div>
        </div>

        <!-- Main chat area -->
        <div class="w-2/3 flex flex-col overflow-hidden">
          <div
            v-if="chatList.length === 0"
            class="flex-1 flex items-center justify-center text-gray-500"
          >
            <div class="text-center">
              <p class="mb-2">{{ t('chat.noChatsAvailable') }}</p>
              <p class="text-sm">{{ t('chat.joinTeamOrTournament') }}</p>
            </div>
          </div>

          <div v-else class="flex flex-col h-full">
            <div
              ref="messageContainer"
              @scroll="handleScroll"
              class="flex-1 overflow-y-auto p-3 bg-gray-50"
            >
              <!-- Loading indicator for initial messages -->
              <div v-if="isLoadingInitialMessages" class="flex items-center justify-center h-full">
                <div class="text-center">
                  <svg
                    class="animate-spin h-8 w-8 text-[#D6B7B0] mx-auto mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p class="text-sm text-gray-500">{{ t('chat.loadingMessages') }}</p>
                </div>
              </div>

              <!-- The rest of the content only displays if initial messages are loaded -->
              <template v-else>
                <!-- Loading indicator for old messages -->
                <div v-if="isLoadingOldMessages" class="text-center py-2">
                  <div class="inline-flex items-center text-sm text-gray-500">
                    <svg
                      class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {{ t('chat.loadingOlderMessages') }}
                  </div>
                </div>

                <!-- Message when no more old messages -->
                <div
                  v-else-if="chatList.length > 0 && !hasMoreMessages.get(chatList[activeChat]?.id)"
                  class="text-center py-2"
                >
                  <div class="text-sm text-gray-400">📋 {{ t('chat.noMoreMessages') }}</div>
                </div>

                <!-- Messages -->
                <div class="space-y-2">
                  <div v-for="(message, index) in currentMessages" :key="index" class="mb-3">
                    <div
                      :class="[
                        message.sender === FromWho.user
                          ? 'ml-auto bg-[#D6B7B0] text-white'
                          : 'bg-gray-200',
                        'rounded-lg p-2 max-w-[90%]',
                      ]"
                    >
                      {{ message.text }}
                    </div>
                    <!-- Display time and username for all messages -->
                    <div
                      class="text-xs text-gray-500 mt-1"
                      :class="message.sender === FromWho.user ? 'text-right mr-1' : 'ml-1'"
                    >
                      <span v-if="message.sender === FromWho.other">{{ message.pseudo }} • </span
                      >{{ message.time }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div class="p-2 border-t border-t-gray-300">
              <div class="flex px-2 mx-1">
                <!-- Removing space-x-2 -->
                <input
                  v-model="messageText"
                  @keyup.enter="sendMessage"
                  type="text"
                  placeholder="Écrivez votre message..."
                  class="flex-1 rounded-l-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#D6B7B0] border-[#D6B7B0] border"
                  :disabled="chatList.length === 0"
                />
                <button
                  @click="sendMessage"
                  class="bg-[#D6B7B0] hover:bg-[#e6c5be] text-white px-2 py-1 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  :disabled="chatList.length === 0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
