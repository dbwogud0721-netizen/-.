import type {
  UserProfile,
  UserProgress,
  QuestCompletion,
  Journal,
  Match,
  Chat,
  Message,
} from './types'
import { generateId, getTodayString, getWeekString } from './utils'
import { LEVELS } from './constants'

const isBrowser = typeof window !== 'undefined'

function get<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

function set<T>(key: string, value: T): void {
  if (!isBrowser) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage write failed:', e)
  }
}

// --- Profile ---
export const profileStorage = {
  get: (): UserProfile | null => get<UserProfile | null>('reset:profile', null),
  set: (profile: UserProfile): void => set('reset:profile', profile),
  exists: (): boolean => get<UserProfile | null>('reset:profile', null) !== null,
}

// --- Progress ---
const defaultProgress: UserProgress = {
  level: 1,
  xp: 0,
  streakDays: 0,
  lastStreakDate: '',
  contactCredits: 1,
  sincerityCards: 0,
  badges: [],
  lastDailyReset: '',
  lastWeeklyReset: '',
  dailyXPEarned: 0,
}

export const progressStorage = {
  get: (): UserProgress => get<UserProgress>('reset:progress', defaultProgress),
  set: (progress: UserProgress): void => set('reset:progress', progress),
  addXP: (amount: number): { newProgress: UserProgress; leveledUp: boolean; newLevel: number } => {
    const current = progressStorage.get()
    const today = getTodayString()

    // Reset daily XP cap if new day
    let dailyXPEarned = current.dailyXPEarned
    if (current.lastDailyReset !== today) {
      dailyXPEarned = 0
    }

    // Clamp daily XP for daily quests (not enforced here — caller manages)
    const newXP = current.xp + amount

    // Determine level
    let newLevel = 1
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (newXP >= LEVELS[i].minXP) {
        newLevel = LEVELS[i].level
        break
      }
    }

    const leveledUp = newLevel > current.level

    // Apply rewards if leveled up
    let contactCredits = current.contactCredits
    let sincerityCards = current.sincerityCards
    const badges = [...current.badges]

    if (leveledUp) {
      const levelConfig = LEVELS.find((l) => l.level === newLevel)
      if (levelConfig?.reward) {
        if (levelConfig.reward.contactCredits) contactCredits += levelConfig.reward.contactCredits
        if (levelConfig.reward.sincerityCards) sincerityCards += levelConfig.reward.sincerityCards
        if (levelConfig.reward.badge && !badges.includes(levelConfig.reward.badge)) {
          badges.push(levelConfig.reward.badge)
        }
      }
    }

    // Update streak
    let streakDays = current.streakDays
    const lastStreak = current.lastStreakDate
    if (lastStreak !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      if (lastStreak === yesterdayStr) {
        streakDays += 1
      } else if (lastStreak === today) {
        // already counted
      } else {
        streakDays = 1
      }
    }

    const newProgress: UserProgress = {
      ...current,
      xp: newXP,
      level: newLevel,
      contactCredits,
      sincerityCards,
      badges,
      streakDays,
      lastStreakDate: today,
      lastDailyReset: today,
      dailyXPEarned: dailyXPEarned + amount,
    }

    progressStorage.set(newProgress)
    return { newProgress, leveledUp, newLevel }
  },
  addContactCredit: (): void => {
    const p = progressStorage.get()
    progressStorage.set({ ...p, contactCredits: p.contactCredits + 1 })
  },
  spendContactCredit: (): boolean => {
    const p = progressStorage.get()
    if (p.contactCredits <= 0) return false
    progressStorage.set({ ...p, contactCredits: p.contactCredits - 1 })
    return true
  },
}

// --- Quest Completions ---
export const questStorage = {
  getAll: (): QuestCompletion[] => get<QuestCompletion[]>('reset:quests', []),
  getByDate: (dateStr: string): QuestCompletion[] => {
    return questStorage.getAll().filter((q) => q.completedAt.startsWith(dateStr))
  },
  isCompleted: (questId: string, period: 'daily' | 'weekly' | 'life'): boolean => {
    const all = questStorage.getAll()
    if (period === 'life') {
      return all.some((q) => q.questId === questId)
    }
    if (period === 'daily') {
      const today = getTodayString()
      return all.some((q) => q.questId === questId && q.completedAt.startsWith(today))
    }
    if (period === 'weekly') {
      const week = getWeekString()
      return all.some((q) => q.questId === questId && q.completedAt.includes(week.split('-W')[1]))
    }
    return false
  },
  complete: (completion: Omit<QuestCompletion, 'completedAt'>): void => {
    const all = questStorage.getAll()
    all.push({ ...completion, completedAt: new Date().toISOString() })
    set('reset:quests', all)
  },
  getTodayDailyCount: (): number => {
    const today = getTodayString()
    const all = questStorage.getAll()
    const dailyIds = ['daily-water', 'daily-walk', 'daily-journal', 'daily-no-sns', 'daily-compliment', 'daily-meal', 'daily-sleep']
    return all.filter((q) => q.completedAt.startsWith(today) && dailyIds.includes(q.questId)).length
  },
}

// --- Journals ---
export const journalStorage = {
  getAll: (): Journal[] => get<Journal[]>('reset:journals', []),
  getById: (id: string): Journal | null => journalStorage.getAll().find((j) => j.id === id) ?? null,
  getByDate: (dateStr: string): Journal | null => journalStorage.getAll().find((j) => j.date === dateStr) ?? null,
  save: (journal: Omit<Journal, 'id' | 'createdAt'>): Journal => {
    const all = journalStorage.getAll()
    const existing = all.findIndex((j) => j.date === journal.date)
    const newJournal: Journal = { ...journal, id: generateId(), createdAt: new Date().toISOString() }
    if (existing >= 0) {
      newJournal.id = all[existing].id
      newJournal.createdAt = all[existing].createdAt
      all[existing] = newJournal
    } else {
      all.unshift(newJournal)
    }
    set('reset:journals', all)
    return newJournal
  },
  delete: (id: string): void => {
    const all = journalStorage.getAll().filter((j) => j.id !== id)
    set('reset:journals', all)
  },
}

// --- Matches ---
export const matchStorage = {
  getAll: (): Match[] => get<Match[]>('reset:matches', []),
  getByTarget: (targetId: string): Match | null =>
    matchStorage.getAll().find((m) => m.targetProfileId === targetId) ?? null,
  create: (targetProfileId: string): Match => {
    const all = matchStorage.getAll()
    const match: Match = {
      id: generateId(),
      targetProfileId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    all.push(match)
    set('reset:matches', all)
    return match
  },
  accept: (matchId: string): Match | null => {
    const all = matchStorage.getAll()
    const idx = all.findIndex((m) => m.id === matchId)
    if (idx < 0) return null
    all[idx] = { ...all[idx], status: 'accepted', updatedAt: new Date().toISOString() }
    set('reset:matches', all)
    return all[idx]
  },
  reject: (matchId: string): void => {
    const all = matchStorage.getAll()
    const idx = all.findIndex((m) => m.id === matchId)
    if (idx < 0) return
    all[idx] = { ...all[idx], status: 'rejected', updatedAt: new Date().toISOString() }
    set('reset:matches', all)
  },
}

// --- Chats ---
export const chatStorage = {
  getAll: (): Chat[] => get<Chat[]>('reset:chats', []).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
  getById: (id: string): Chat | null => get<Chat[]>('reset:chats', []).find((c) => c.id === id) ?? null,
  getByMatchId: (matchId: string): Chat | null => get<Chat[]>('reset:chats', []).find((c) => c.matchId === matchId) ?? null,
  create: (matchId: string, targetProfileId: string): Chat => {
    const all = get<Chat[]>('reset:chats', [])
    const chat: Chat = {
      id: generateId(),
      matchId,
      targetProfileId,
      messages: [],
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    }
    all.push(chat)
    set('reset:chats', all)
    return chat
  },
  sendMessage: (chatId: string, message: Omit<Message, 'id' | 'read'>): Message => {
    const all = get<Chat[]>('reset:chats', [])
    const idx = all.findIndex((c) => c.id === chatId)
    if (idx < 0) throw new Error('Chat not found')

    const newMsg: Message = { ...message, id: generateId(), read: false }
    all[idx].messages.push(newMsg)
    all[idx].lastMessage = message.text ?? '사진'
    all[idx].lastMessageAt = message.createdAt

    set('reset:chats', all)
    return newMsg
  },
  markRead: (chatId: string): void => {
    const all = get<Chat[]>('reset:chats', [])
    const idx = all.findIndex((c) => c.id === chatId)
    if (idx < 0) return
    all[idx].messages = all[idx].messages.map((m) => ({ ...m, read: true }))
    all[idx].unreadCount = 0
    set('reset:chats', all)
  },
  addBotMessage: (chatId: string, text: string): void => {
    const all = get<Chat[]>('reset:chats', [])
    const idx = all.findIndex((c) => c.id === chatId)
    if (idx < 0) return
    const msg: Message = {
      id: generateId(),
      senderId: 'bot',
      text,
      createdAt: new Date().toISOString(),
      read: false,
    }
    all[idx].messages.push(msg)
    all[idx].lastMessage = text
    all[idx].lastMessageAt = msg.createdAt
    all[idx].unreadCount += 1
    set('reset:chats', all)
  },
}
