'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight } from 'lucide-react'
import { journalStorage } from '@/lib/storage'
import { formatDate, getTodayString } from '@/lib/utils'
import type { Journal } from '@/lib/types'

const MOOD_EMOJI: Record<string, string> = {
  '좋아요': '😊', '평온해요': '😌', '멍해요': '😶',
  '외로워요': '🥺', '슬퍼요': '😢', '화나요': '😤', '불안해요': '😰',
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">감정 일기</h1>
          <p className="text-sm text-stone-500 mt-1">솔직한 기록이 회복을 만들어요.</p>
        </div>
        <Link href="/journal/write">
          <button className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </button>
        </Link>
      </div>

      {/* Today's entry */}
      {todayJournal ? (
        <Link href={`/journal/write?date=${todayStr}`}>
          <div className="bg-white rounded-2xl p-5 mb-4 border-2 border-coral-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-coral-500 bg-coral-50 px-2 py-0.5 rounded-full">오늘</span>
              <span className="text-xs text-stone-400">{formatDate(todayStr)}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{MOOD_EMOJI[todayJournal.mood]}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-800">{todayJournal.mood}</p>
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
          <div className="bg-white rounded-2xl p-5 mb-4 border-2 border-dashed border-stone-200 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-2xl">
              📝
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">오늘 감정 기록하기</p>
              <p className="text-xs text-stone-400 mt-0.5">오늘의 감정을 짧게 적어봐요</p>
            </div>
            <ChevronRight size={16} className="text-stone-300" />
          </div>
        </Link>
      )}

      {/* Past entries */}
      {journals.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">아직 기록이 없어요.</p>
          <p className="text-xs mt-1">오늘 첫 감정을 기록해봐요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-400">이전 기록</p>
          {journals
            .filter((j) => j.date !== todayStr)
            .map((journal) => (
              <Link key={journal.id} href={`/journal/write?date=${journal.date}`}>
                <div className="bg-white rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-xl mt-0.5">{MOOD_EMOJI[journal.mood]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-stone-600">{formatDate(journal.date)}</p>
                      <p className="text-xs text-stone-400">{journal.mood}</p>
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
