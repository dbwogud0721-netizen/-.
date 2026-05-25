'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Flame, ChevronRight, Target } from 'lucide-react'
import { profileStorage, progressStorage, questStorage, journalStorage } from '@/lib/storage'
import { calculateBreakupDays, getLevelConfig, getTodayString, formatDate } from '@/lib/utils'
import { DAILY_QUEST_TEMPLATES, DAILY_MESSAGES } from '@/lib/constants'
import type { UserProfile, UserProgress, Journal } from '@/lib/types'

function AvatarImage({ profileImage, name, size = 40 }: { profileImage: string | null; name: string; size?: number }) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className="rounded-full object-cover border border-stone-100"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name.charAt(0)}
    </div>
  )
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '좋은 아침이에요'
    if (hour < 18) return '오늘도 잘 지내고 있나요'
    return '오늘 하루도 수고했어요'
  }

  return (
    <div className="px-5 pt-6 pb-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">{getGreeting()}</p>
          <h1 className="text-xl font-semibold text-stone-900 mt-0.5">{profile.name}님</h1>
        </div>
        <AvatarImage profileImage={profile.profileImage} name={profile.name} size={44} />
      </div>

      {/* Breakup days + streak */}
      <div className="bg-white rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-stone-400 font-medium">이별한 지</p>
            <p className="text-3xl font-semibold text-stone-900 mt-1">
              {breakupDays}
              <span className="text-lg font-normal text-stone-500 ml-1">일째</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Flame size={16} className="text-coral-500" />
              <span className="text-sm font-semibold text-stone-900">{progress.streakDays}일 연속</span>
            </div>
            <p className="text-xs text-stone-400 mt-1">회복 기록 중</p>
          </div>
        </div>

        {/* Level progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500">Lv.{levelConfig.level}</span>
              <span className="text-sm font-semibold text-stone-900">{levelConfig.name}</span>
            </div>
            <span className="text-xs text-stone-400">
              {progress.xp.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-coral-500 rounded-full transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          {nextLevel && (
            <p className="text-xs text-stone-400 mt-1.5 text-right">
              다음 레벨까지 {(nextLevel.minXP - progress.xp).toLocaleString()} XP
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail size={16} className="text-coral-400" />
            <span className="text-xs font-medium text-stone-500">연락 보내기</span>
          </div>
          <p className="text-2xl font-semibold text-stone-900">{progress.contactCredits}</p>
          <p className="text-xs text-stone-400 mt-0.5">회 남음</p>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-stone-500" />
            <span className="text-xs font-medium text-stone-500">오늘 퀘스트</span>
          </div>
          <p className="text-2xl font-semibold text-stone-900">{dailyCompleted}</p>
          <p className="text-xs text-stone-400 mt-0.5">/ 7 완료</p>
        </div>
      </div>

      {/* Today's mood */}
      {todayJournal ? (
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-stone-900">오늘의 감정</p>
            <Link href="/journal" className="text-xs text-stone-400">더보기</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xl">
              {getMoodEmoji(todayJournal.mood)}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800">{todayJournal.mood}</p>
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{todayJournal.content}</p>
            </div>
          </div>
        </div>
      ) : (
        <Link href="/journal/write">
          <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-stone-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xl">
              📝
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">오늘 감정 기록하기</p>
              <p className="text-xs text-stone-400 mt-0.5">+10 XP</p>
            </div>
            <ChevronRight size={16} className="text-stone-300 ml-auto" />
          </div>
        </Link>
      )}

      {/* Today's quests preview */}
      <div className="bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-stone-900">오늘의 퀘스트</p>
          <Link href="/quest" className="text-xs text-coral-500 font-medium">모두 보기</Link>
        </div>
        <div className="space-y-3">
          {todayQuests.map((quest, i) => {
            const done = todayQuestCompletions[i]
            return (
              <Link key={quest.id} href={`/quest/${quest.id}`}>
                <div className="flex items-center gap-3 py-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    done ? 'bg-coral-500 border-coral-500' : 'border-stone-300'
                  }`}>
                    {done && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={`text-sm flex-1 ${done ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                    {quest.title}
                  </span>
                  <span className="text-xs text-stone-400">+{quest.xp} XP</span>
                </div>
              </Link>
            )
          })}
        </div>
        {dailyCompleted >= 3 && (
          <div className="mt-4 bg-coral-50 rounded-xl p-3 text-center">
            <p className="text-xs text-coral-600 font-medium">오늘의 퀘스트 3개 완료 🎉 연락 보내기 +1회</p>
          </div>
        )}
      </div>

      {/* Daily message */}
      <div className="bg-stone-900 rounded-2xl p-5">
        <p className="text-xs text-stone-400 font-medium mb-2">오늘의 메시지</p>
        <p className="text-sm text-white leading-relaxed">{dailyMessage}</p>
      </div>

      <div className="h-4" />
    </div>
  )
}

function getMoodEmoji(mood: string): string {
  const map: Record<string, string> = {
    '좋아요': '😊', '평온해요': '😌', '멍해요': '😶',
    '외로워요': '🥺', '슬퍼요': '😢', '화나요': '😤', '불안해요': '😰',
  }
  return map[mood] ?? '😶'
}
