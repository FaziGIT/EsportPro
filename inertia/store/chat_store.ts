import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    isChatOpen: false,
    scrollPosition: 0,
    activeChat: 0,
  }),
  actions: {
    toggleChat() {
      this.isChatOpen = !this.isChatOpen
    },
  },
})
