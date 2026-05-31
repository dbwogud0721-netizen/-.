'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { journalStorage } from '@/lib/storage'
import { getTodayString } from '@/lib/utils'
import type { Journal } from '@/lib/types'

const MOOD_EMOJI: Record<string, string> = {
  '좋아요': '😊', '평온해요': '😌', '멍해요': '😶',
  '외로워요': '🥺', '슬퍼요': '😢', '화나요': '😤', '불안해요': '😰',
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']

function getWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function dateToString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function JournalPage() {
  const [journals, setJournals] = useState<Journal[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setJournals(journalStorage.getAll())
    setMounted(true)
  }, [])

  const todayStr = getTodayString()
  const todayJournal = journals.find((j) => j.date === todayStr)
  const weekDates = getWeekDates()
  const journalDateSet = new Set(journals.map((j) => j.date))
  const today = new Date()

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900">감정 일기</h1>
          <p className="text-sm text-stone-400 mt-0.5">솔직한 기록이 회복을 만들어요.</p>
        </div>
        <Link href="/journal/write">
          <button className="w-10 h-10 rounded-full bg-coral-500 flex items-center justify-center shadow-sm">
            <Plus size={20} className="text-white" />
          </button>
        </Link>
      </div>

      {/* Week calendar */}
      <div className="card p-4 mb-4">
        <p className="text-xs font-bold text-stone-400 mb-3">이번 주 기록</p>
        <div className="flex justify-between">
          {weekDates.map((d) => {
            const ds = dateToString(d)
            const isToday = ds === todayStr
            const hasEntry = journalDateSet.has(ds)
            const isPast = d <= today
            const dayIndex = d.getDay()

            return (
              <div key={ds} className="flex flex-col items-center gap-1.5">
                <span className={`text-[10px] font-medium ${isToday ? 'text-coral-500' : 'text-stone-400'}`}>
                  {DAY_KO[dayIndex]}
                </span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isToday
                    ? 'bg-coral-500 text-white shadow-sm'
                    : hasEntry
                    ? 'bg-coral-50 text-coral-600 ring-2 ring-coral-200'
                    : isPast
                    ? 'bg-stone-100 text-stone-400'
                    : 'bg-stone-50 text-stone-300'
                }`}>
                  {hasEntry && !isToday ? (
                    <span className="text-lg">{MOOD_EMOJI[journals.find((j) => j.date === ds)?.mood ?? ''] ?? '•'}</span>
                  ) : (
                    d.getDate()
                  )}
                </div>
                {hasEntry && (
                  <div className="w-1 h-1 rounded-full bg-coral-400" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's entry */}
      {todayJournal ? (
        <Link href={`/journal/write?date=${todayStr}`}>
          <div className="card p-5 mb-4" style={{ border: '2px solid #EDE9FE' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-coral-500 bg-coral-50 px-2.5 py-0.5 rounded-full">오늘</span>
              <span className="text-xs text-stone-400">{formatDate(todayStr)}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{MOOD_EMOJI[todayJournal.mood]}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-stone-800">{todayJournal.mood}</p>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2 leading-relaxed">{todayJournal.content}</p>
                {todayJournal.aiFeedback && (
                  <p className="text-xs text-stone-400 mt-2 italic">"{todayJournal.aiFeedback}"</p>
                )}
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <Link href="/journal/write">
          <div className="card p-5 mb-4 border-2 border-dashed border-stone-200 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-coral-50 flex items-center justify-center text-2xl flex-shrink-0">
              📝
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-stone-900">기분은 어때요?</p>
              <p className="text-xs text-stone-400 mt-0.5">오늘의 감정을 짧게 적어봐요</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-coral-500 flex items-center justify-center flex-shrink-0">
              <Plus size={16} className="text-white" />
            </div>
          </div>
        </Link>
      )}

      {/* Past entries */}
      {journals.filter((j) => j.date !== todayStr).length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p className="text-3xl mb-3">🌱</p>
          <p className="text-sm font-medium">아직 기록이 없어요.</p>
          <p className="text-xs mt-1">오늘 첫 감정을 기록해봐요.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-stone-400 mb-1">이전 기록</p>
          {journals
            .filter((j) => j.date !== todayStr)
            .map((journal) => (
              <Link key={journal.id} href={`/journal/write?date=${journal.date}`}>
                <div className="card p-4 flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{MOOD_EMOJI[journal.mood]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-stone-500">{formatDate(journal.date)}</p>
                      <span className="text-xs text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">{journal.mood}</span>
                    </div>
                    <p className="text-sm text-stone-700 mt-1 line-clamp-2 leading-relaxed">{journal.content}</p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}
