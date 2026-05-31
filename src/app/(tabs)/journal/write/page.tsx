'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, X, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import { journalStorage, questStorage, progressStorage } from '@/lib/storage'
import { getJournalFeedback } from '@/lib/ai-service'
import { getTodayString, formatDate } from '@/lib/utils'
import type { Mood } from '@/lib/types'

const MOODS: { value: Mood; emoji: string }[] = [
  { value: '좋아요', emoji: '😊' },
  { value: '평온해요', emoji: '😌' },
  { value: '멍해요', emoji: '😶' },
  { value: '외로워요', emoji: '🥺' },
  { value: '슬퍼요', emoji: '😢' },
  { value: '화나요', emoji: '😤' },
  { value: '불안해요', emoji: '😰' },
]

export default function JournalWritePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream"><div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" /></div>}>
      <JournalWriteInner />
    </Suspense>
  )
}

function JournalWriteInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dateParam = searchParams.get('date') ?? getTodayString()
  const isToday = dateParam === getTodayString()

  const [mood, setMood] = useState<Mood | null>(null)
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const existing = journalStorage.getByDate(dateParam)
    if (existing) {
      setMood(existing.mood)
      setContent(existing.content)
      setImage(existing.image ?? null)
    }
    setMounted(true)
  }, [dateParam])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!mood || content.trim().length < 50 || saving) return
    setSaving(true)

    const aiFeedback = await getJournalFeedback(mood, content)

    journalStorage.save({
      date: dateParam,
      mood,
      content: content.trim(),
      image: image ?? undefined,
      aiFeedback,
    })

    // Complete journal daily quest if writing today
    if (isToday) {
      const alreadyDone = questStorage.isCompleted('daily-journal', 'daily')
      if (!alreadyDone) {
        questStorage.complete({ questId: 'daily-journal', proofText: content })
        const { leveledUp, newLevel } = progressStorage.addXP(10)
        // Could show level up modal, skip for simplicity in journal page
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push('/journal'), 800)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header
        title={isToday ? '오늘의 기록' : formatDate(dateParam)}
        showBack
        right={
          <button
            onClick={handleSave}
            disabled={!mood || content.trim().length < 50 || saving}
            className={`text-sm font-semibold ${
              mood && content.trim().length >= 50 && !saving
                ? 'text-coral-500'
                : 'text-stone-300'
            }`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? '완료' : '저장'}
          </button>
        }
      />

      <div className="pt-14 px-5 pb-32 space-y-6 animate-fade-in">
        {/* Date */}
        <div className="mt-4">
          <p className="text-xs text-stone-400">{formatDate(dateParam)}</p>
        </div>

        {/* Mood selection */}
        <div>
          <p className="text-sm font-semibold text-stone-900 mb-3">오늘 기분이 어때요?</p>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map(({ value, emoji }) => (
              <button
                key={value}
                onClick={() => setMood(value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                  mood === value
                    ? 'border-coral-500 bg-coral-50'
                    : 'border-stone-100 bg-white'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className={`text-[10px] font-medium ${mood === value ? 'text-coral-600' : 'text-stone-500'}`}>
                  {value}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="text-sm font-semibold text-stone-900 mb-3">어떤 하루였나요?</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="판단 없이, 솔직하게 적어봐요."
            rows={7}
            maxLength={1000}
            className="w-full bg-white border border-stone-100 rounded-2xl px-5 py-4 text-base text-stone-900 placeholder-stone-300 focus:outline-none focus:border-coral-200 focus:ring-2 focus:ring-coral-100 resize-none transition-all"
          />
          <p className="text-right text-xs text-stone-400 mt-1">{content.length} / 1000</p>
        </div>

        {/* Photo */}
        <div>
          <p className="text-sm font-semibold text-stone-900 mb-3">사진 첨부 (선택)</p>
          {image ? (
            <div className="relative">
              <img src={image} alt="일기 사진" className="w-full rounded-2xl object-cover max-h-64" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center gap-2 hover:border-coral-300 transition-colors"
            >
              <Upload size={20} className="text-stone-400" />
              <span className="text-sm text-stone-400">사진 추가</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pb-8 pt-4 bg-cream">
        <button
          onClick={handleSave}
          disabled={!mood || content.trim().length < 50 || saving}
          className={`w-full h-14 rounded-2xl text-base font-semibold transition-all ${
            mood && content.trim().length >= 50 && !saving
              ? saved ? 'bg-coral-500 text-white' : 'bg-stone-900 text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              기록 중...
            </span>
          ) : saved ? '저장됨 ✓' : '기록하기'}
        </button>
        {mood && content.trim().length < 50 && content.length > 0 && (
          <p className="text-xs text-stone-400 text-center mt-2">{50 - content.trim().length}자 더 적어주세요.</p>
        )}
        {!mood && <p className="text-xs text-stone-400 text-center mt-2">감정을 먼저 선택해주세요.</p>}
      </div>
    </div>
  )
}
