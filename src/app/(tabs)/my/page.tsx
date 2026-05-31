'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Settings, ShoppingBag, Award, Edit3 } from 'lucide-react'
import { profileStorage, progressStorage, questStorage, journalStorage } from '@/lib/storage'
import { calculateBreakupDays, getLevelConfig } from '@/lib/utils'
import type { UserProfile, UserProgress } from '@/lib/types'

function Avatar({ profileImage, name, size = 80 }: { profileImage: string | null; name: string; size?: number }) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className="rounded-full object-cover ring-4 ring-white"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-white flex items-center justify-center text-coral-500 font-bold ring-4 ring-white"
      style={{ width: size, height: size, fontSize: size * 0.35, boxShadow: '0 4px 24px rgba(139,92,246,0.18)' }}
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
    <div className="pb-6 animate-fade-in">
      {/* Gradient header */}
      <div className="gradient-hero px-5 pt-10 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white opacity-[0.06] -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white opacity-[0.06] translate-y-12 -translate-x-12" />

        {/* Top row */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-bold opacity-90">마이</span>
          </div>
          <Link href="/my/settings">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Settings size={18} className="text-white" />
            </div>
          </Link>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center relative z-10">
          <div className="relative mb-3">
            <Avatar profileImage={profile.profileImage} name={profile.name} size={84} />
            <Link href="/my/edit">
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md">
                <Edit3 size={13} className="text-coral-500" />
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <span className="text-xs font-bold bg-white bg-opacity-20 text-white px-2 py-0.5 rounded-full">
              👑 Lv.{levelConfig.level}
            </span>
          </div>
          {profile.bio && (
            <p className="text-xs text-white opacity-70 mt-1.5 text-center max-w-[200px] leading-relaxed">{profile.bio}</p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-white opacity-60 bg-white bg-opacity-10 px-2.5 py-0.5 rounded-full">
              이별 {breakupDays}일째
            </span>
          </div>
        </div>
      </div>

      {/* Stats cards (overlap with header) */}
      <div className="px-5 -mt-8 mb-4 relative z-10">
        <div className="card p-4">
          <div className="grid grid-cols-3 divide-x divide-stone-100">
            <StatItem value={`${progress.streakDays}일`} label="연속 기록" />
            <StatItem value={`${stats.questCount}개`} label="퀘스트" />
            <StatItem value={`${stats.journalCount}개`} label="일기" />
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="px-5 mb-4">
        <Link href="/my/level">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <span className="text-xs font-bold text-coral-500">Lv.{levelConfig.level}</span>
                <span className="text-sm font-bold text-stone-900 ml-2">{levelConfig.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-400">{progress.xp.toLocaleString()} XP</span>
                <ChevronRight size={14} className="text-stone-300" />
              </div>
            </div>
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-coral-500 rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            {nextLevel && (
              <p className="text-xs text-stone-400 mt-1.5 text-right">
                다음까지 {(nextLevel.minXP - progress.xp).toLocaleString()} XP
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="px-5 mb-4">
          <div className="card p-4">
            <p className="text-sm font-bold text-stone-900 mb-3">획득 배지</p>
            <div className="flex flex-wrap gap-2">
              {progress.badges.map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 bg-coral-50 rounded-full px-3 py-1.5">
                  <span className="text-sm">🏅</span>
                  <span className="text-xs font-bold text-coral-700">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="px-5">
        <div className="card overflow-hidden">
          <MenuItem href="/my/shop" icon={<ShoppingBag size={18} className="text-coral-500" />} label="상점" sub={`연락 보내기 ${progress.contactCredits}회 보유`} />
          <MenuItem href="/my/level" icon={<Award size={18} className="text-coral-500" />} label="레벨 상세" sub="회복 여정 보기" />
          <MenuItem href="/my/edit" icon={<Edit3 size={18} className="text-coral-500" />} label="내 정보 수정" />
          <MenuItem href="/my/settings" icon={<Settings size={18} className="text-coral-500" />} label="설정" last />
        </div>
      </div>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <p className="text-lg font-bold text-stone-900">{value}</p>
      <p className="text-xs text-stone-400 mt-0.5">{label}</p>
    </div>
  )
}

function MenuItem({
  href, icon, label, sub, last,
}: {
  href: string; icon: React.ReactNode; label: string; sub?: string; last?: boolean
}) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3.5 px-5 py-4 ${!last ? 'border-b border-stone-50' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-coral-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-stone-900">{label}</p>
          {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
        </div>
        <ChevronRight size={16} className="text-stone-300" />
      </div>
    </Link>
  )
}
