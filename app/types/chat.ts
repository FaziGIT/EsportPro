export interface ChatMessage {
  text: string
  sender?: 'user' | 'other'
  time: string
  pseudo?: string
  channel: string
}

export interface Chat {
  id: string
  name: string
  lastMessage: string
  unread: number
  messages: ChatMessage[]
}

export enum FromWho {
  'user' = 'user',
  'other' = 'other',
}

export interface UserChannel {
  id: string
  name: string
  entityType: string
  tournamentId?: string
  teamId?: string
  displayName: string
  messages: ChatMessage[]
  lastMessage: string
}
