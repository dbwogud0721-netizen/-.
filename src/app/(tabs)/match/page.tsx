'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Heart, Star, ShoppingBag, CheckCircle2, Clock } from 'lucide-react'
import { profileStorage, progressStorage, matchStorage, chatStorage } from '@/lib/storage'
import { calculateBreakupDays, getLevelConfig } from '@/lib/utils'
import { DUMMY_PROFILES, LEVELS } from '@/lib/constants'
import type { UserProfile, UserProgress, DummyProfile, Match } from '@/lib/types'

function ProfileAvatar({ profile, size = 80 }: { profile: DummyProfile; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: profile.avatarColor, fontSize: size * 0.38 }}
    >
      {profile.name.charAt(0)}
    </div>
  )
}

export default function MatchPage() {
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<DummyProfile[]>([])
  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  const reload = () => {
    const p = profileStorage.get()
    const prog = progressStorage.get()
    const m = matchStorage.getAll()
    setMyProfile(p)
    setProgress(prog)
    setMatches(m)
    if (p) {
      setFilteredProfiles(
        DUMMY_PROFILES.filter(
          (dp) =>
            dp.age >= p.preferredMinAge &&
            dp.age <= p.preferredMaxAge &&
            dp.gender !== p.gender
        )
      )
    }
  }

  useEffect(() => {
    reload()
    setMounted(true)
  }, [])

  const handleSendContact = (targetId: string) => {
    if (!progress || progress.contactCredits <= 0) return
    const spent = progressStorage.spendContactCredit()
    if (!spent) return
    matchStorage.create(targetId)
    reload()
  }

  const handleAcceptSimulate = (matchId: string, targetId: string) => {
    matchStorage.accept(matchId)
    const existingChat = chatStorage.getByMatchId(matchId)
    if (!existingChat) chatStorage.create(matchId, targetId)
    reload()
  }

  if (!mounted || !myProfile || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  const matchedIds = new Set(matches.map((m) => m.targetProfileId))
  const pendingMatches = matches.filter((m) => m.status === 'pending')
  const acceptedMatches = matches.filter((m) => m.status === 'accepted')
  const browsable = filteredProfiles.filter((p) => !matchedIds.has(p.id))
  const currentProfile = browsable[currentIndex]

  const handlePass = () => setCurrentIndex((i) => i + 1)
  const handleLike = () => {
    if (currentProfile) {
      handleSendContact(currentProfile.id)
    }
    setCurrentIndex((i) => i + 1)
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900">매칭</h1>
            <p className="text-sm text-stone-400 mt-0.5">회복하는 사람들을 만나보세요</p>
          </div>
          <Link href="/my/shop">
            <div className="flex items-center gap-1.5 bg-coral-50 rounded-full px-3 py-1.5">
              <ShoppingBag size={13} className="text-coral-500" />
              <span className="text-xs font-bold text-coral-600">{progress.contactCredits}회</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-2 mb-5">
        {(['browse', 'requests'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 h-10 rounded-full text-xs font-bold transition-all relative ${
              activeTab === tab
                ? 'bg-coral-500 text-white shadow-sm'
                : 'bg-white text-stone-500 border border-stone-200'
            }`}
          >
            {tab === 'browse' ? '탐색' : '요청 현황'}
            {tab === 'requests' && pendingMatches.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                {pendingMatches.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <div className="px-5">
          {browsable.length === 0 || !currentProfile ? (
            <div className="card p-8 text-center">
              <p className="text-2xl mb-3">✨</p>
              <p className="text-sm font-semibold text-stone-900 mb-1">모든 프로필을 봤어요</p>
              <p className="text-xs text-stone-400">선호 나이 범위를 변경하거나 나중에 다시 확인해보세요.</p>
            </div>
          ) : (
            <>
              {/* Swipe card */}
              <div className="rounded-3xl overflow-hidden shadow-lg animate-scale-in" key={currentProfile.id}>
                {/* Profile photo area — full gradient */}
                <div
                  className="h-72 flex flex-col items-center justify-end pb-6 relative"
                  style={{
                    background: `linear-gradient(160deg, ${currentProfile.avatarColor}dd 0%, ${currentProfile.avatarColor}88 60%, ${currentProfile.avatarColor}33 100%)`,
                  }}
                >
                  {/* Big avatar letter centered */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-32 h-32 rounded-full flex items-center justify-center text-white font-black text-6xl shadow-xl"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '3px solid rgba(255,255,255,0.3)' }}
                  >
                    {currentProfile.name.charAt(0)}
                  </div>

                  {/* Level badge */}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-coral-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    👑 Lv.{currentProfile.level}
                  </div>

                  {/* Name overlay at bottom */}
                  <div className="w-full px-5 relative z-10">
                    <h2 className="text-2xl font-black text-white drop-shadow-md">
                      {currentProfile.name}, {currentProfile.age}
                    </h2>
                    <p className="text-sm text-white opacity-80 mt-0.5 drop-shadow-sm">{currentProfile.location}</p>
                  </div>

                  {/* Dot indicators */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {browsable.slice(0, Math.min(browsable.length, 6)).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all bg-white ${
                          i === currentIndex % 6 ? 'w-5 opacity-100' : 'w-1.5 opacity-40'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Profile info */}
                <div className="bg-white px-5 pt-4 pb-2">
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs bg-coral-50 text-coral-600 font-bold px-2.5 py-1 rounded-full">
                      이별 {calculateBreakupDays(currentProfile.breakupDate)}일째
                    </span>
                    <span className="text-xs bg-stone-100 text-stone-500 font-medium px-2.5 py-1 rounded-full">
                      {currentProfile.relationshipGoal}
                    </span>
                  </div>

                  <p className="text-sm text-stone-600 leading-relaxed mb-3">{currentProfile.bio}</p>

                  {currentProfile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {currentProfile.interests.map((i) => (
                        <span key={i} className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-100">
                          #{i}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="bg-white px-5 pb-5 pt-3 flex items-center justify-center gap-5">
                  <button
                    onClick={handlePass}
                    className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center shadow-md transition-transform active:scale-90"
                  >
                    <X size={26} className="text-stone-500" />
                  </button>
                  <button
                    onClick={handlePass}
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
                    style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}
                  >
                    <Star size={20} className="text-white" fill="white" />
                  </button>
                  <button
                    onClick={handleLike}
                    disabled={progress.contactCredits <= 0}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90 ${
                      progress.contactCredits > 0
                        ? 'bg-gradient-to-br from-coral-400 to-coral-600'
                        : 'bg-stone-200'
                    }`}
                  >
                    <Heart size={26} className="text-white" fill="white" />
                  </button>
                </div>

                {progress.contactCredits <= 0 && (
                  <div className="bg-white mx-0 pb-4 text-center">
                    <p className="text-xs text-stone-400">연락 보내기 횟수 부족</p>
                    <Link href="/my/shop">
                      <p className="text-xs font-bold text-coral-500 mt-0.5">충전하기 →</p>
                    </Link>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-stone-400 mt-3">
                {currentIndex + 1} / {browsable.length}명
              </p>
            </>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="px-5 space-y-4">
          {pendingMatches.length === 0 && acceptedMatches.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-2xl mb-3">💌</p>
              <p className="text-sm font-semibold text-stone-900 mb-1">아직 보낸 연락이 없어요</p>
              <p className="text-xs text-stone-400">탐색 탭에서 마음에 드는 분께 먼저 연락해보세요.</p>
            </div>
          ) : (
            <>
              {pendingMatches.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-stone-400 mb-3">수락 대기 중</p>
                  <div className="space-y-2.5">
                    {pendingMatches.map((match) => {
                      const profile = DUMMY_PROFILES.find((p) => p.id === match.targetProfileId)
                      if (!profile) return null
                      return (
                        <div key={match.id} className="card p-4 flex items-center gap-3">
                          <ProfileAvatar profile={profile} size={48} />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-stone-900">{profile.name}, {profile.age}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock size={11} className="text-stone-400" />
                              <span className="text-xs text-stone-400">수락 대기 중</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAcceptSimulate(match.id, profile.id)}
                            className="h-8 px-3 bg-stone-100 text-stone-500 rounded-xl text-xs font-medium"
                          >
                            수락 시뮬
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {acceptedMatches.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-stone-400 mb-3">연결됨</p>
                  <div className="space-y-2.5">
                    {acceptedMatches.map((match) => {
                      const profile = DUMMY_PROFILES.find((p) => p.id === match.targetProfileId)
                      if (!profile) return null
                      const chat = chatStorage.getByMatchId(match.id)
                      return (
                        <div key={match.id} className="card p-4 flex items-center gap-3">
                          <ProfileAvatar profile={profile} size={48} />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-stone-900">{profile.name}, {profile.age}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <CheckCircle2 size={11} className="text-coral-500" />
                              <span className="text-xs text-coral-500 font-medium">연결됨</span>
                            </div>
                          </div>
                          {chat && (
                            <Link href={`/chat/${chat.id}`}>
                              <button className="h-9 px-4 bg-coral-500 text-white rounded-xl text-xs font-bold shadow-sm">
                                채팅
                              </button>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
