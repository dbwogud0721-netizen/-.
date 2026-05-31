'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import { questStorage } from '@/lib/storage'
import { DAILY_QUEST_TEMPLATES, WEEKLY_QUEST_TEMPLATES, LIFE_QUEST_TEMPLATES } from '@/lib/constants'
import { getDifficultyLabel } from '@/lib/utils'
import type { QuestTemplate } from '@/lib/types'

type Tab = 'daily' | 'weekly' | 'life'

const QUEST_ICONS: Record<string, string> = {
  'daily-water': '💧', 'daily-walk': '🚶', 'daily-journal': '📝',
  'daily-no-sns': '📵', 'daily-compliment': '💪', 'daily-meal': '🍚', 'daily-sleep': '🌙',
  'weekly-exercise': '🏋️', 'weekly-cafe': '☕', 'weekly-friend': '💌',
  'weekly-gift': '🎁', 'weekly-clean': '🧹', 'weekly-read': '📖', 'weekly-meditate': '🧘',
  'life-travel': '✈️', 'life-hobby': '🎨', 'life-stuff': '📦',
  'life-photo': '📸', 'life-30days': '🏆', 'life-cooking': '🍳',
}

const XP_COLORS: Record<string, string> = {
  easy: 'text-emerald-600 bg-emerald-50',
  normal: 'text-blue-600 bg-blue-50',
  hard: 'text-orange-600 bg-orange-50',
  big: 'text-coral-500 bg-coral-50',
}

export default function QuestPage() {
  const [activeTab, setActiveTab] = useState<Tab>('daily')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  const quests = {
    daily: DAILY_QUEST_TEMPLATES,
    weekly: WEEKLY_QUEST_TEMPLATES,
    life: LIFE_QUEST_TEMPLATES,
  }[activeTab]

  useEffect(() => {
    const ids = new Set<string>()
    const all = [...DAILY_QUEST_TEMPLATES, ...WEEKLY_QUEST_TEMPLATES, ...LIFE_QUEST_TEMPLATES]
    for (const q of all) {
      if (questStorage.isCompleted(q.id, q.type)) ids.add(q.id)
    }
    setCompletedIds(ids)
    setMounted(true)
  }, [])

  const dailyCompleted = DAILY_QUEST_TEMPLATES.filter((q) => completedIds.has(q.id)).length
  const weeklyCompleted = WEEKLY_QUEST_TEMPLATES.filter((q) => completedIds.has(q.id)).length
  const lifeCompleted = LIFE_QUEST_TEMPLATES.filter((q) => completedIds.has(q.id)).length

  const tabs: { id: Tab; label: string; emoji: string; count: number; total: number }[] = [
    { id: 'daily', label: '일일', emoji: '☀️', count: dailyCompleted, total: DAILY_QUEST_TEMPLATES.length },
    { id: 'weekly', label: '주간', emoji: '📅', count: weeklyCompleted, total: WEEKLY_QUEST_TEMPLATES.length },
    { id: 'life', label: '인생', emoji: '🌱', count: lifeCompleted, total: LIFE_QUEST_TEMPLATES.length },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  const completedCount = { daily: dailyCompleted, weekly: weeklyCompleted, life: lifeCompleted }[activeTab]
  const totalCount = { daily: DAILY_QUEST_TEMPLATES.length, weekly: WEEKLY_QUEST_TEMPLATES.length, life: LIFE_QUEST_TEMPLATES.length }[activeTab]

  return (
    <div className="pt-6 pb-6">
      {/* Header */}
      <div className="px-5 mb-5">
        <h1 className="text-xl font-bold text-stone-900">퀘스트</h1>
        <p className="text-sm text-stone-400 mt-0.5">작은 실천이 쌓여요.</p>
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 h-10 rounded-full text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-coral-500 text-white shadow-sm'
                : 'bg-white text-stone-500 border border-stone-200'
            }`}
          >
            {tab.emoji} {tab.label}
            <span className={`ml-1 text-[11px] ${activeTab === tab.id ? 'opacity-70' : 'text-stone-400'}`}>
              {tab.count}/{tab.total}
            </span>
          </button>
        ))}
      </div>

      {/* Progress summary */}
      <div className="mx-5 mb-4">
        <div className="card px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-stone-600">
                {completedCount === 0
                  ? '아직 완료한 퀘스트가 없어요'
                  : `${completedCount}개 완료했어요!`}
              </p>
              <span className="text-xs text-stone-400">{completedCount}/{totalCount}</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-coral-500 rounded-full transition-all duration-700"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily reward notice */}
      {activeTab === 'daily' && (
        <div className="mx-5 mb-4 bg-coral-50 rounded-2xl p-3 flex items-center gap-2">
          <span className="text-lg">💌</span>
          <p className="text-xs text-coral-700 font-medium">
            일일 퀘스트 3개 완료 시 연락 +1회 · 오늘 {dailyCompleted}/3 완료
          </p>
        </div>
      )}

      {/* Quest list */}
      <div className="px-5 space-y-2.5">
        {quests.map((quest) => {
          const done = completedIds.has(quest.id)
          return <QuestCard key={quest.id} quest={quest} done={done} />
        })}
      </div>
    </div>
  )
}

function QuestCard({ quest, done }: { quest: QuestTemplate; done: boolean }) {
  const xpStyle = XP_COLORS[quest.difficulty] ?? 'text-stone-600 bg-stone-100'
  const icon = QUEST_ICONS[quest.id] ?? '⭐'

  return (
    <Link href={`/quest/${quest.id}`}>
      <div className={`card p-4 flex items-center gap-3.5 transition-all ${done ? 'opacity-60' : ''}`}>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
          done ? 'bg-coral-50' : 'bg-stone-50'
        }`}>
          {done ? <CheckCircle2 size={22} className="text-coral-500" /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${done ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
            {quest.title}
          </p>
          <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{quest.description}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${xpStyle}`}>
          +{quest.xp} XP
        </span>
      </div>
    </Link>
  )
}
