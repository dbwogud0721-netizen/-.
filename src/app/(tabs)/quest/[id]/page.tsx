'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Camera, Clock, Pen, CheckCircle2, Upload, X } from 'lucide-react'
import Header from '@/components/layout/Header'
import LevelUpModal from '@/components/features/LevelUpModal'
import { ALL_QUEST_TEMPLATES } from '@/lib/constants'
import { questStorage, progressStorage } from '@/lib/storage'
import { getDifficultyLabel, formatSeconds } from '@/lib/utils'
import type { QuestTemplate } from '@/lib/types'

const DAILY_XP_CAP = 100

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [quest, setQuest] = useState<QuestTemplate | null>(null)
  const [isDone, setIsDone] = useState(false)
  const [proofPhoto, setProofPhoto] = useState<string | null>(null)
  const [proofText, setProofText] = useState('')
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerRemaining, setTimerRemaining] = useState(0)
  const [timerCompleted, setTimerCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [xpResult, setXpResult] = useState<{ earned: number } | null>(null)

  useEffect(() => {
    const template = ALL_QUEST_TEMPLATES.find((q) => q.id === id)
    if (!template) { router.back(); return }
    setQuest(template)
    setTimerRemaining(template.timerSeconds ?? 0)

    const done = questStorage.isCompleted(id, template.type)
    setIsDone(done)
    setMounted(true)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [id, router])

  const startTimer = useCallback(() => {
    if (!quest?.timerSeconds) return
    setTimerRunning(true)
    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setTimerRunning(false)
          setTimerCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [quest])

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerRunning(false)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setProofPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const canComplete = () => {
    if (!quest) return false
    if (isDone) return false
    switch (quest.verificationType) {
      case 'photo': return proofPhoto !== null
      case 'text': return proofText.trim().length >= 5
      case 'timer': return timerCompleted
      case 'none': return true
      default: return false
    }
  }

  const handleComplete = async () => {
    if (!quest || !canComplete() || completing) return
    setCompleting(true)

    // Check daily XP cap for daily quests
    const progress = progressStorage.get()
    let xpToAdd = quest.xp
    if (quest.type === 'daily') {
      const today = new Date().toISOString().split('T')[0]
      const dailyEarned = progress.lastDailyReset === today ? progress.dailyXPEarned : 0
      xpToAdd = Math.min(quest.xp, Math.max(0, DAILY_XP_CAP - dailyEarned))
    }

    questStorage.complete({
      questId: quest.id,
      proofImage: proofPhoto ?? undefined,
      proofText: proofText || undefined,
      timerCompleted: timerCompleted || undefined,
    })

    const { leveledUp, newLevel: lv } = progressStorage.addXP(xpToAdd)

    // Check if 3 daily quests done → give contact credit
    const todayDailyCount = questStorage.getTodayDailyCount()
    if (todayDailyCount === 3) {
      progressStorage.addContactCredit()
    }

    setXpResult({ earned: xpToAdd })
    setIsDone(true)
    setCompleting(false)

    if (leveledUp) {
      setNewLevel(lv)
      setShowLevelUp(true)
    }
  }

  if (!mounted || !quest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  const typeIcon: Record<string, React.ReactNode> = {
    photo: <Camera size={20} className="text-stone-600" />,
    text: <Pen size={20} className="text-stone-600" />,
    timer: <Clock size={20} className="text-stone-600" />,
    none: <CheckCircle2 size={20} className="text-stone-600" />,
  }

  const difficultyBadge: Record<string, string> = {
    easy: 'bg-emerald-50 text-emerald-700',
    normal: 'bg-blue-50 text-blue-700',
    hard: 'bg-orange-50 text-orange-700',
    big: 'bg-coral-50 text-coral-700',
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header title="퀘스트" showBack />

      <div className="pt-14 px-5 pb-32 space-y-5 animate-fade-in">
        {/* Quest info card */}
        <div className="bg-white rounded-2xl p-5 mt-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              {typeIcon[quest.verificationType]}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-stone-900">{quest.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyBadge[quest.difficulty]}`}>
                  {getDifficultyLabel(quest.difficulty)}
                </span>
                <span className="text-xs font-semibold text-coral-500">+{quest.xp} XP</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{quest.description}</p>
        </div>

        {/* Already done */}
        {isDone && xpResult === null && (
          <div className="bg-white rounded-2xl p-5 text-center">
            <CheckCircle2 size={40} className="text-coral-500 mx-auto mb-3" />
            <p className="text-base font-semibold text-stone-900">완료했어요</p>
            <p className="text-sm text-stone-500 mt-1">오늘은 이미 완료한 퀘스트예요.</p>
          </div>
        )}

        {/* XP earned result */}
        {xpResult && (
          <div className="bg-coral-50 rounded-2xl p-5 text-center animate-fade-in">
            <p className="text-3xl font-semibold text-coral-600 mb-1">+{xpResult.earned} XP</p>
            <p className="text-sm text-coral-700">잘했어요. 조금씩 나아가고 있어요.</p>
          </div>
        )}

        {/* Verification section */}
        {!isDone && (
          <>
            <div className="bg-white rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-stone-900 mb-4">인증하기</h2>

              {quest.verificationType === 'photo' && (
                <div>
                  <p className="text-xs text-stone-500 mb-3">퀘스트를 완료한 사진을 업로드해주세요.</p>
                  {proofPhoto ? (
                    <div className="relative">
                      <img src={proofPhoto} alt="인증" className="w-full rounded-xl object-cover max-h-60" />
                      <button
                        onClick={() => setProofPhoto(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-36 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-coral-400 transition-colors"
                    >
                      <Upload size={24} className="text-stone-400" />
                      <span className="text-sm text-stone-400">사진 업로드</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              )}

              {quest.verificationType === 'text' && (
                <div>
                  <p className="text-xs text-stone-500 mb-3">오늘의 퀘스트에 대해 짧게 적어주세요. (5자 이상)</p>
                  <textarea
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="솔직하게 적어봐요."
                    rows={4}
                    maxLength={200}
                    className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-coral-200 resize-none"
                  />
                  <p className="text-right text-xs text-stone-400 mt-1">{proofText.length} / 200</p>
                </div>
              )}

              {quest.verificationType === 'timer' && (
                <div className="text-center">
                  <p className="text-xs text-stone-500 mb-4">타이머를 시작하고 완료까지 유지해주세요.</p>
                  <div className="text-5xl font-light text-stone-900 mb-6 tabular-nums">
                    {formatSeconds(timerRemaining)}
                  </div>
                  {timerCompleted ? (
                    <div className="flex items-center justify-center gap-2 text-coral-500">
                      <CheckCircle2 size={20} />
                      <span className="text-sm font-semibold">완료!</span>
                    </div>
                  ) : (
                    <button
                      onClick={timerRunning ? pauseTimer : startTimer}
                      className={`h-12 px-8 rounded-xl text-sm font-semibold transition-colors ${
                        timerRunning
                          ? 'bg-stone-100 text-stone-700'
                          : 'bg-stone-900 text-white'
                      }`}
                    >
                      {timerRunning ? '일시정지' : timerRemaining === quest.timerSeconds ? '시작' : '계속하기'}
                    </button>
                  )}
                </div>
              )}

              {quest.verificationType === 'none' && (
                <div className="text-center py-4">
                  <CheckCircle2 size={32} className="text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">완료 버튼을 눌러 기록해주세요.</p>
                </div>
              )}
            </div>

            {/* Complete button */}
            <button
              onClick={handleComplete}
              disabled={!canComplete() || completing}
              className={`w-full h-14 rounded-2xl text-base font-semibold transition-all ${
                canComplete() && !completing
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {completing ? '기록 중...' : '완료하기'}
            </button>

            {!canComplete() && (
              <p className="text-xs text-stone-400 text-center -mt-2">
                {quest.verificationType === 'photo' && '사진을 먼저 업로드해주세요.'}
                {quest.verificationType === 'text' && '5자 이상 적어주세요.'}
                {quest.verificationType === 'timer' && '타이머를 완료해주세요.'}
              </p>
            )}
          </>
        )}
      </div>

      <LevelUpModal isOpen={showLevelUp} newLevel={newLevel} onClose={() => setShowLevelUp(false)} />
    </div>
  )
}
