'use client'

import { LEVELS } from '@/lib/constants'
import type { LevelConfig } from '@/lib/types'

interface LevelUpModalProps {
  isOpen: boolean
  newLevel: number
  onClose: () => void
}

export default function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  if (!isOpen) return null

  const levelConfig = LEVELS.find((l) => l.level === newLevel)
  if (!levelConfig) return null

  const reward = levelConfig.reward

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl">
        <div className="text-5xl mb-4">✨</div>
        <p className="text-xs font-medium text-coral-500 tracking-widest uppercase mb-2">
          Level {newLevel}
        </p>
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">{levelConfig.name}</h2>
        <p className="text-sm text-stone-500 mb-6">조금씩 나를 다시 찾고 있어요.</p>

        {reward && (
          <div className="bg-stone-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <p className="text-xs font-medium text-stone-500 mb-3">받은 보상</p>
            {reward.contactCredits && (
              <div className="flex items-center gap-2">
                <span className="text-base">💌</span>
                <span className="text-sm text-stone-700">연락 보내기 +{reward.contactCredits}회</span>
              </div>
            )}
            {reward.sincerityCards && (
              <div className="flex items-center gap-2">
                <span className="text-base">🩷</span>
                <span className="text-sm text-stone-700">진심 카드 +{reward.sincerityCards}장</span>
              </div>
            )}
            {reward.badge && (
              <div className="flex items-center gap-2">
                <span className="text-base">🏅</span>
                <span className="text-sm text-stone-700">'{reward.badge}' 배지</span>
              </div>
            )}
            {reward.priorityBoost && (
              <div className="flex items-center gap-2">
                <span className="text-base">⭐</span>
                <span className="text-sm text-stone-700">우선 추천 1회</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full h-12 bg-stone-900 text-white rounded-xl text-sm font-medium"
        >
          계속하기
        </button>
      </div>
    </div>
  )
}
