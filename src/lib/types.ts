export type Gender = 'male' | 'female'
export type QuestType = 'daily' | 'weekly' | 'life'
export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'big'
export type VerificationType = 'photo' | 'text' | 'timer' | 'none'
export type MatchStatus = 'pending' | 'accepted' | 'rejected'
export type Mood = '좋아요' | '평온해요' | '멍해요' | '외로워요' | '슬퍼요' | '화나요' | '불안해요'
export type RelationshipGoal = string
export type Vibe = string
export type CurrentState = '멍하다' | '외롭다' | '다시 시작하고 싶다' | '그냥 대화가 필요하다'

export interface UserProfile {
  id: string
  name: string
  gender: Gender
  birthDate: string
  age: number
  profileImage: string | null
  height: number | null
  job: string
  location: string
  breakupDate: string
  bio: string
  interests: string[]
  preferredMinAge: number
  preferredMaxAge: number
  preferredVibes: Vibe[]
  relationshipGoal: RelationshipGoal
  currentState: CurrentState
  createdAt: string
}

export interface UserProgress {
  level: number
  xp: number
  streakDays: number
  lastStreakDate: string
  contactCredits: number
  sincerityCards: number
  badges: string[]
  lastDailyReset: string
  lastWeeklyReset: string
  dailyXPEarned: number
}

export interface QuestTemplate {
  id: string
  title: string
  description: string
  type: QuestType
  difficulty: QuestDifficulty
  xp: number
  verificationType: VerificationType
  timerSeconds?: number
}

export interface QuestCompletion {
  questId: string
  completedAt: string
  proofImage?: string
  proofText?: string
  timerCompleted?: boolean
}

export interface Journal {
  id: string
  date: string
  mood: Mood
  content: string
  image?: string
  aiFeedback: string
  createdAt: string
}

export interface Match {
  id: string
  targetProfileId: string
  status: MatchStatus
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  senderId: string
  text?: string
  image?: string
  createdAt: string
  read: boolean
}

export interface Chat {
  id: string
  matchId: string
  targetProfileId: string
  messages: Message[]
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface DummyProfile {
  id: string
  name: string
  age: number
  gender: Gender
  location: string
  avatarColor: string
  breakupDate: string
  bio: string
  interests: string[]
  level: number
  xp: number
  completedQuestTitles: string[]
  preferredVibes: Vibe[]
  relationshipGoal: RelationshipGoal
}

export interface LevelConfig {
  level: number
  name: string
  minXP: number
  reward: {
    contactCredits?: number
    sincerityCards?: number
    badge?: string
    priorityBoost?: boolean
  } | null
}
