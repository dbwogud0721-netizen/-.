'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame, ChevronRight, Mail } from 'lucide-react'
import { profileStorage, progressStorage, questStorage, journalStorage } from '@/lib/storage'
import { calculateBreakupDays, getLevelConfig, getTodayString } from '@/lib/utils'
import { DAILY_QUEST_TEMPLATES, DAILY_MESSAGES } from '@/lib/constants'
import type { UserProfile, UserProgress, Journal } from '@/lib/types'

function Avatar({ profileImage, name, size = 44 }: { profileImage: string | null; name: string; size?: number }) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className="rounded-full object-cover ring-2 ring-white"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-coral-100 flex items-center justify-center text-coral-600 font-bold ring-2 ring-white"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name.charAt(0)}
    </div>
  )
}

const MOOD_EMOJI: Record<string, string> = {
  '좋아요': '😊', '평온해요': '😌', '멍해요': '😶',
  '외로워요': '🥺', '슬퍼요': '😢', '화나요': '😤', '불안해요': '😰',
}

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [todayJournal, setTodayJournal] = useState<Journal | null>(null)
  const [dailyCompleted, setDailyCompleted] = useState(0)
  const [mounted, setMounted] = useState(false)

  const dailyMessage = DAILY_MESSAGES[new Date().getDate() % DAILY_MESSAGES.length]

  useEffect(() => {
    setProfile(profileStorage.get())
    setProgress(progressStorage.get())
    setTodayJournal(journalStorage.getByDate(getTodayString()))
    setDailyCompleted(questStorage.getTodayDailyCount())
    setMounted(true)
  }, [])

  if (!mounted || !profile || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  const breakupDays = calculateBreakupDays(profile.breakupDate)
  const { current: levelConfig, next: nextLevel, progress: levelProgress } = getLevelConfig(progress.xp)
  const todayQuests = DAILY_QUEST_TEMPLATES.slice(0, 3)
  const todayQuestCompletions = todayQuests.map((q) => questStorage.isCompleted(q.id, 'daily'))

  return (
    <div className="px-5 pt-6 pb-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-400 font-medium">이별을 지나가고,</p>
          <h1 className="text-lg font-bold text-stone-900 mt-0.5">나는 더 빛날 거야 ✨</h1>
        </div>
        <div className="relative">
          <Avatar profileImage={profile.profileImage} name={profile.name} size={44} />
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-coral-500 rounded-full flex items-center justify-center shadow-sm">
            <Flame size={11} className="text-white" />
          </div>
        </div>
      </div>

      {/* Hero card */}
      <div className="gradient-hero rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white opacity-[0.06] -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white opacity-[0.06] translate-y-10 -translate-x-10" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-xs opacity-60 mb-1">이별한 지</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-bold leading-none">{breakupDays}</span>
              <span className="text-xl font-medium opacity-80">일째</span>
            </div>
            <div className="flex gap-5 mt-4">
              <div>
                <div className="flex items-center gap-1">
                  <Flame size={12} className="opacity-70" />
                  <span className="text-xl font-bold">{progress.streakDays}</span>
                </div>
                <p className="text-xs opacity-60">연속</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Mail size={12} className="opacity-70" />
                  <span className="text-xl font-bold">{progress.contactCredits}</span>
                </div>
                <p className="text-xs opacity-60">연락</p>
              </div>
              <div>
                <p className="text-xl font-bold">{progress.xp.toLocaleString()}</p>
                <p className="text-xs opacity-60">XP</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="w-[76px] h-[76px] rounded-full flex flex-col items-center justify-center"
              style={{ border: '3px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.12)' }}
            >
              <p className="text-[10px] opacity-70 leading-none mb-0.5">Lv</p>
              <p className="text-3xl font-bold leading-none">{levelConfig.level}</p>
            </div>
            <p className="text-xs opacity-70 text-center max-w-[80px] leading-tight">{levelConfig.name}</p>
            <div className="w-[76px] h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
            {nextLevel && (
              <p className="text-[10px] opacity-50 text-center">다음까지 {(nextLevel.minXP - progress.xp).toLocaleString()} XP</p>
            )}
          </div>
        </div>
      </div>

      {/* Today's mood */}
      {todayJournal ? (
        <Link href={`/journal/write?date=${getTodayString()}`}>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-coral-50 flex items-center justify-center text-2xl flex-shrink-0">
              {MOOD_EMOJI[todayJournal.mood] ?? '😶'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-coral-500">오늘의 감정</p>
              <p className="text-sm font-medium text-stone-800 mt-0.5">{todayJournal.mood}</p>
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{todayJournal.content}</p>
            </div>
            <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
          </div>
        </Link>
      ) : (
        <Link href="/journal/write">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center text-2xl flex-shrink-0">📝</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">오늘 감정 기록하기</p>
              <p className="text-xs text-coral-500 font-semibold mt-0.5">+10 XP</p>
            </div>
            <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
          </div>
        </Link>
      )}

      {/* Today's quests */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-sm font-bold text-stone-900">오늘의 퀘스트</p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-stone-400">{dailyCompleted} / 7</span>
            <Link href="/quest">
              <span className="text-xs font-semibold text-coral-500">모두 보기</span>
            </Link>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-coral-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min((dailyCompleted / 7) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="divide-y divide-stone-50">
          {todayQuests.map((quest, i) => {
            const done = todayQuestCompletions[i]
            return (
              <Link key={quest.id} href={`/quest/${quest.id}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    done ? 'bg-coral-500 border-coral-500' : 'border-stone-200'
                  }`}>
                    {done && <span className="text-white text-[9px] font-bold">✓</span>}
                  </div>
                  <span className={`text-sm flex-1 ${done ? 'text-stone-400 line-through' : 'text-stone-800 font-medium'}`}>
                    {quest.title}
                  </span>
                  <span className="text-xs font-bold text-coral-500 bg-coral-50 px-2 py-0.5 rounded-full">
                    +{quest.xp}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
        {dailyCompleted >= 3 && (
          <div className="mx-4 mb-4 mt-1 bg-coral-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-coral-600 font-semibold">🎉 퀘스트 3개 완료! 연락 보내기 +1회</p>
          </div>
        )}
      </div>

      {/* Daily message */}
      <div className="gradient-dark rounded-2xl p-5">
        <p className="text-xs text-stone-500 font-medium mb-2">오늘의 메시지</p>
        <p className="text-sm text-white leading-relaxed">{dailyMessage}</p>
      </div>

      <div className="h-2" />
    </div>
  )
}
