'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Settings, ShoppingBag, Award, Edit3 } from 'lucide-react'
import { profileStorage, progressStorage, questStorage, journalStorage } from '@/lib/storage'
import { calculateBreakupDays, getLevelConfig } from '@/lib/utils'
import { LEVELS } from '@/lib/constants'
import type { UserProfile, UserProgress } from '@/lib/types'

function AvatarImage({ profileImage, name, size = 80 }: { profileImage: string | null; name: string; size?: number }) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className="rounded-full object-cover border-2 border-stone-100"
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

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [stats, setStats] = useState({ questCount: 0, journalCount: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProfile(profileStorage.get())
    const prog = progressStorage.get()
    setProgress(prog)
    setStats({
      questCount: questStorage.getAll().length,
      journalCount: journalStorage.getAll().length,
    })
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

  return (
    <div className="px-5 pt-6 pb-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">마이</h1>
        <Link href="/my/settings">
          <button className="w-9 h-9 rounded-full flex items-center justify-center">
            <Settings size={20} className="text-stone-500" />
          </button>
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <AvatarImage profileImage={profile.profileImage} name={profile.name} size={72} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">{profile.name}</h2>
              <Link href="/my/edit">
                <button className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <Edit3 size={14} className="text-stone-600" />
                </button>
              </Link>
            </div>
            {profile.job && <p className="text-sm text-stone-500 mt-0.5">{profile.job}</p>}
            {profile.location && <p className="text-xs text-stone-400">{profile.location}</p>}
            <div className="mt-2">
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                이별 {breakupDays}일째
              </span>
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-stone-600 mt-4 leading-relaxed border-t border-stone-50 pt-4">
            {profile.bio}
          </p>
        )}

        {profile.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.interests.map((i) => (
              <span key={i} className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
                #{i}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Level card */}
      <Link href="/my/level">
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-stone-400 font-medium">현재 레벨</p>
              <p className="text-lg font-semibold text-stone-900 mt-0.5">
                Lv.{levelConfig.level} <span className="text-base font-medium">{levelConfig.name}</span>
              </p>
            </div>
            <ChevronRight size={18} className="text-stone-300" />
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-coral-500 rounded-full transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>{progress.xp.toLocaleString()} XP</span>
            {nextLevel && <span>다음까지 {(nextLevel.minXP - progress.xp).toLocaleString()} XP</span>}
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="연속 기록" value={`${progress.streakDays}일`} />
        <StatCard label="퀘스트" value={`${stats.questCount}개`} />
        <StatCard label="일기" value={`${stats.journalCount}개`} />
      </div>

      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="bg-white rounded-2xl p-5">
          <p className="text-sm font-semibold text-stone-900 mb-3">획득 배지</p>
          <div className="flex flex-wrap gap-2">
            {progress.badges.map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 bg-stone-50 rounded-full px-3 py-1.5">
                <span className="text-sm">🏅</span>
                <span className="text-xs font-medium text-stone-700">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <MenuItem href="/my/shop" icon={<ShoppingBag size={18} className="text-stone-500" />} label="상점" sub="연락 보내기 충전" />
        <MenuItem href="/my/level" icon={<Award size={18} className="text-stone-500" />} label="레벨 상세" sub="회복 여정 보기" />
        <MenuItem href="/my/edit" icon={<Edit3 size={18} className="text-stone-500" />} label="내 정보 수정" />
        <MenuItem href="/my/settings" icon={<Settings size={18} className="text-stone-500" />} label="설정" last />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 text-center">
      <p className="text-lg font-semibold text-stone-900">{value}</p>
      <p className="text-xs text-stone-400 mt-0.5">{label}</p>
    </div>
  )
}

function MenuItem({
  href,
  icon,
  label,
  sub,
  last,
}: {
  href: string
  icon: React.ReactNode
  label: string
  sub?: string
  last?: boolean
}) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-5 py-4 ${!last ? 'border-b border-stone-50' : ''}`}>
        {icon}
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-900">{label}</p>
          {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
        </div>
        <ChevronRight size={16} className="text-stone-300" />
      </div>
    </Link>
  )
}
