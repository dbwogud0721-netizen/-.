'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import { progressStorage } from '@/lib/storage'
import { getLevelConfig } from '@/lib/utils'
import { LEVELS } from '@/lib/constants'
import type { UserProgress } from '@/lib/types'

export default function LevelPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProgress(progressStorage.get())
    setMounted(true)
  }, [])

  if (!mounted || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  const { current: levelConfig, next: nextLevel, progress: levelProgress } = getLevelConfig(progress.xp)

  return (
    <div className="min-h-screen bg-cream">
      <Header title="레벨 상세" showBack />
      <div className="pt-14 px-5 pb-10 space-y-5 animate-fade-in">
        {/* Current level */}
        <div className="mt-4 bg-stone-900 rounded-2xl p-6 text-center">
          <p className="text-xs text-stone-400 font-medium mb-1">현재 레벨</p>
          <p className="text-4xl font-semibold text-white mb-1">{levelConfig.level}</p>
          <p className="text-lg text-stone-300">{levelConfig.name}</p>
          <p className="text-xs text-stone-500 mt-2">{progress.xp.toLocaleString()} XP</p>
        </div>

        {/* Progress */}
        {nextLevel && (
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-stone-900">다음 레벨까지</p>
              <p className="text-sm text-coral-500 font-semibold">{(nextLevel.minXP - progress.xp).toLocaleString()} XP</p>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-coral-500 rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-stone-400">
              <span>Lv.{levelConfig.level} {levelConfig.name}</span>
              <span>Lv.{nextLevel.level} {nextLevel.name}</span>
            </div>
          </div>
        )}

        {/* All levels */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-stone-50">
            <p className="text-sm font-semibold text-stone-900">전체 레벨</p>
          </div>
          {LEVELS.map((level, idx) => {
            const isPast = progress.xp >= level.minXP
            const isCurrent = level.level === levelConfig.level
            const isNext = level.level === (levelConfig.level + 1)

            return (
              <div
                key={level.level}
                className={`flex items-center gap-4 px-5 py-4 ${idx < LEVELS.length - 1 ? 'border-b border-stone-50' : ''} ${isCurrent ? 'bg-coral-50' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isPast ? 'bg-coral-500 text-white' : 'bg-stone-100 text-stone-400'
                }`}>
                  {level.level}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isPast ? 'text-stone-900' : 'text-stone-400'}`}>
                    {level.name}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{level.minXP.toLocaleString()} XP~</p>
                </div>
                <div className="text-right">
                  {level.reward && (
                    <div className="text-xs text-stone-400 space-y-0.5">
                      {level.reward.contactCredits && <p>💌 +{level.reward.contactCredits}</p>}
                      {level.reward.sincerityCards && <p>🩷 +{level.reward.sincerityCards}</p>}
                      {level.reward.badge && <p>🏅 배지</p>}
                      {level.reward.priorityBoost && <p>⭐ 우선추천</p>}
                    </div>
                  )}
                  {isPast && !isCurrent && (
                    <CheckCircle2 size={16} className="text-coral-500 ml-auto" />
                  )}
                  {isCurrent && (
                    <span className="text-xs font-medium text-coral-500 bg-coral-100 px-2 py-0.5 rounded-full">현재</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* How to earn XP */}
        <div className="bg-white rounded-2xl p-5">
          <p className="text-sm font-semibold text-stone-900 mb-4">XP 얻는 방법</p>
          <div className="space-y-3">
            <XPRow label="일일 퀘스트 (쉬움)" xp="+10" />
            <XPRow label="일일 퀘스트 (보통)" xp="+20" />
            <XPRow label="주간 퀘스트 (어려움)" xp="+35" />
            <XPRow label="인생 퀘스트" xp="+60" />
            <XPRow label="감정 일기 작성" xp="+10" />
          </div>
          <p className="text-xs text-stone-400 mt-4">
            ※ 일일 퀘스트 최대 100 XP / 일
          </p>
        </div>
      </div>
    </div>
  )
}

function XPRow({ label, xp }: { label: string; xp: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-stone-700">{label}</p>
      <p className="text-sm font-semibold text-coral-500">{xp}</p>
    </div>
  )
}
