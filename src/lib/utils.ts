import { LEVELS } from './constants'
import type { LevelConfig } from './types'

export function calculateBreakupDays(breakupDate: string): number {
  const breakup = new Date(breakupDate)
  const today = new Date()
  const diff = today.getTime() - breakup.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function getLevelConfig(xp: number): { current: LevelConfig; next: LevelConfig | null; progress: number } {
  let current = LEVELS[0]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      current = LEVELS[i]
      break
    }
  }

  const currentIdx = LEVELS.findIndex((l) => l.level === current.level)
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null

  let progress = 100
  if (next) {
    const rangeStart = current.minXP
    const rangeEnd = next.minXP
    progress = Math.min(100, ((xp - rangeStart) / (rangeEnd - rangeStart)) * 100)
  }

  return { current, next, progress }
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getWeekString(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${weekNum}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return formatDate(dateStr)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getDifficultyLabel(difficulty: string): string {
  const map: Record<string, string> = {
    easy: '쉬움',
    normal: '보통',
    hard: '어려움',
    big: '큰 회복',
  }
  return map[difficulty] ?? difficulty
}

export function getXPColor(difficulty: string): string {
  const map: Record<string, string> = {
    easy: 'text-emerald-600',
    normal: 'text-blue-600',
    hard: 'text-orange-600',
    big: 'text-coral-500',
  }
  return map[difficulty] ?? 'text-stone-600'
}
