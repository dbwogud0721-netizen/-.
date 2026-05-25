'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { questStorage } from '@/lib/storage'
import { DAILY_QUEST_TEMPLATES, WEEKLY_QUEST_TEMPLATES, LIFE_QUEST_TEMPLATES } from '@/lib/constants'
import { getDifficultyLabel } from '@/lib/utils'
import type { QuestTemplate } from '@/lib/types'

type Tab = 'daily' | 'weekly' | 'life'

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
    const checkCompleted = () => {
      const ids = new Set<string>()
      const all = [...DAILY_QUEST_TEMPLATES, ...WEEKLY_QUEST_TEMPLATES, ...LIFE_QUEST_TEMPLATES]
      for (const q of all) {
        const type = q.type
        if (questStorage.isCompleted(q.id, type)) {
          ids.add(q.id)
        }
      }
      setCompletedIds(ids)
    }
    checkCompleted()
    setMounted(true)
  }, [])

  const dailyCompleted = DAILY_QUEST_TEMPLATES.filter((q) => completedIds.has(q.id)).length
  const weeklyCompleted = WEEKLY_QUEST_TEMPLATES.filter((q) => completedIds.has(q.id)).length
  const lifeCompleted = LIFE_QUEST_TEMPLATES.filter((q) => completedIds.has(q.id)).length

  const tabs: { id: Tab; label: string; count: number; total: number }[] = [
    { id: 'daily', label: '일일', count: dailyCompleted, total: DAILY_QUEST_TEMPLATES.length },
    { id: 'weekly', label: '주간', count: weeklyCompleted, total: WEEKLY_QUEST_TEMPLATES.length },
    { id: 'life', label: '인생', count: lifeCompleted, total: LIFE_QUEST_TEMPLATES.length },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-6 pb-6">
      {/* Header */}
      <div className="px-5 mb-5">
        <h1 className="text-xl font-semibold text-stone-900">퀘스트</h1>
        <p className="text-sm text-stone-500 mt-1">작은 실천이 쌓여요.</p>
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 h-10 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.id ? 'text-stone-400' : 'text-stone-400'}`}>
              {tab.count}/{tab.total}
            </span>
          </button>
        ))}
      </div>

      {/* Daily reward notice */}
      {activeTab === 'daily' && (
        <div className="mx-5 mb-4 bg-coral-50 rounded-xl p-3 flex items-center gap-2">
          <span className="text-sm">💌</span>
          <p className="text-xs text-coral-700">
            일일 퀘스트 3개 완료 시 연락 보내기 +1회 · 오늘 {dailyCompleted}/3 완료
          </p>
        </div>
      )}

      {/* Quest list */}
      <div className="px-5 space-y-3">
        {quests.map((quest) => {
          const done = completedIds.has(quest.id)
          return (
            <QuestCard key={quest.id} quest={quest} done={done} />
          )
        })}
      </div>
    </div>
  )
}

function QuestCard({ quest, done }: { quest: QuestTemplate; done: boolean }) {
  const xpStyle = XP_COLORS[quest.difficulty] ?? 'text-stone-600 bg-stone-100'
  const verifyIcon: Record<string, string> = { photo: '📷', text: '✏️', timer: '⏱️', none: '✓' }

  return (
    <Link href={`/quest/${quest.id}`}>
      <div className={`bg-white rounded-2xl p-4 flex items-center gap-4 transition-all ${done ? 'opacity-60' : ''}`}>
        <div className="flex-shrink-0">
          {done ? (
            <CheckCircle2 size={24} className="text-coral-500" />
          ) : (
            <Circle size={24} className="text-stone-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className={`text-sm font-medium ${done ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
              {quest.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">{verifyIcon[quest.verificationType]} {getDifficultyLabel(quest.difficulty)}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${xpStyle}`}>
              +{quest.xp} XP
            </span>
          </div>
        </div>
        <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
      </div>
    </Link>
  )
}
