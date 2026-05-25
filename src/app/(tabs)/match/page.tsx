'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, ShoppingBag, CheckCircle2, Clock } from 'lucide-react'
import { profileStorage, progressStorage, matchStorage, chatStorage } from '@/lib/storage'
import { calculateBreakupDays, getLevelConfig } from '@/lib/utils'
import { DUMMY_PROFILES, LEVELS } from '@/lib/constants'
import type { UserProfile, UserProgress, DummyProfile, Match } from '@/lib/types'

function ProfileAvatar({ profile, size = 80 }: { profile: DummyProfile; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: profile.avatarColor,
        fontSize: size * 0.35,
      }}
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
  const [mounted, setMounted] = useState(false)

  const reload = () => {
    const p = profileStorage.get()
    const prog = progressStorage.get()
    const m = matchStorage.getAll()
    setMyProfile(p)
    setProgress(prog)
    setMatches(m)

    if (p) {
      const filtered = DUMMY_PROFILES.filter(
        (dp) => dp.age >= p.preferredMinAge && dp.age <= p.preferredMaxAge
      )
      setFilteredProfiles(filtered)
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
    // Create chat room
    const existingChat = chatStorage.getByMatchId(matchId)
    if (!existingChat) {
      chatStorage.create(matchId, targetId)
    }
    reload()
  }

  const pendingMatches = matches.filter((m) => m.status === 'pending')
  const acceptedMatches = matches.filter((m) => m.status === 'accepted')

  if (!mounted || !myProfile || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  const matchedIds = new Set(matches.map((m) => m.targetProfileId))

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-6 mb-5">
        <h1 className="text-xl font-semibold text-stone-900">매칭</h1>
        <p className="text-sm text-stone-500 mt-1">회복하는 사람들을 만나보세요.</p>
      </div>

      {/* Credits bar */}
      <div className="mx-5 mb-5 bg-white rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-coral-400" />
          <span className="text-sm font-medium text-stone-700">연락 보내기 {progress.contactCredits}회 남음</span>
        </div>
        <Link href="/my/shop">
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <ShoppingBag size={14} />
            <span>충전</span>
          </div>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-2 mb-5">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 h-10 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'browse' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          탐색
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 h-10 rounded-xl text-sm font-medium transition-all relative ${
            activeTab === 'requests' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          요청 현황
          {pendingMatches.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral-500 rounded-full text-white text-[10px] flex items-center justify-center">
              {pendingMatches.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="px-5 space-y-4">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-sm">조건에 맞는 프로필이 없어요.</p>
              <p className="text-xs mt-1">선호 나이 범위를 변경해보세요.</p>
            </div>
          ) : (
            filteredProfiles.map((profile) => {
              const match = matches.find((m) => m.targetProfileId === profile.id)
              const levelConfig = LEVELS.find((l) => l.level === profile.level) ?? LEVELS[0]
              const breakupDays = calculateBreakupDays(profile.breakupDate)

              return (
                <MatchCard
                  key={profile.id}
                  profile={profile}
                  match={match}
                  levelConfig={levelConfig}
                  breakupDays={breakupDays}
                  contactCredits={progress.contactCredits}
                  onSendContact={() => handleSendContact(profile.id)}
                  onAccept={() => match && handleAcceptSimulate(match.id, profile.id)}
                />
              )
            })
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="px-5 space-y-4">
          {pendingMatches.length === 0 && acceptedMatches.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-sm">아직 보낸 연락이 없어요.</p>
              <p className="text-xs mt-1">탐색 탭에서 먼저 연락을 보내보세요.</p>
            </div>
          ) : (
            <>
              {pendingMatches.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-500 mb-3">수락 대기 중</p>
                  {pendingMatches.map((match) => {
                    const profile = DUMMY_PROFILES.find((p) => p.id === match.targetProfileId)
                    if (!profile) return null
                    return (
                      <PendingCard
                        key={match.id}
                        profile={profile}
                        match={match}
                        onAccept={() => handleAcceptSimulate(match.id, profile.id)}
                      />
                    )
                  })}
                </div>
              )}
              {acceptedMatches.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-500 mb-3">수락됨</p>
                  {acceptedMatches.map((match) => {
                    const profile = DUMMY_PROFILES.find((p) => p.id === match.targetProfileId)
                    if (!profile) return null
                    const chat = chatStorage.getByMatchId(match.id)
                    return (
                      <div key={match.id} className="bg-white rounded-2xl p-4 flex items-center gap-3">
                        <ProfileAvatar profile={profile} size={48} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-stone-900">{profile.name}, {profile.age}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={12} className="text-coral-500" />
                            <span className="text-xs text-coral-500">연결됨</span>
                          </div>
                        </div>
                        {chat && (
                          <Link href={`/chat/${chat.id}`}>
                            <button className="h-9 px-4 bg-stone-900 text-white rounded-xl text-xs font-medium">
                              채팅
                            </button>
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MatchCard({
  profile,
  match,
  levelConfig,
  breakupDays,
  contactCredits,
  onSendContact,
  onAccept,
}: {
  profile: DummyProfile
  match: Match | undefined
  levelConfig: { name: string; level: number }
  breakupDays: number
  contactCredits: number
  onSendContact: () => void
  onAccept: () => void
}) {
  const chat = match?.status === 'accepted' ? chatStorage.getByMatchId(match?.id ?? '') : null

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Top: avatar + basic info */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ProfileAvatar profile={profile} size={72} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-stone-900">{profile.name}, {profile.age}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{profile.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                이별 {breakupDays}일째
              </span>
              <span className="text-xs bg-coral-50 text-coral-600 px-2 py-0.5 rounded-full">
                Lv.{levelConfig.level} {levelConfig.name}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-600 mt-4 leading-relaxed">{profile.bio}</p>

        {/* Recent quests */}
        {profile.completedQuestTitles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.completedQuestTitles.slice(0, 2).map((t) => (
              <span key={t} className="text-xs bg-stone-50 text-stone-500 px-2.5 py-1 rounded-full border border-stone-100">
                ✓ {t}
              </span>
            ))}
          </div>
        )}

        {/* Interests */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {profile.interests.map((i) => (
            <span key={i} className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
              #{i}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom action */}
      <div className="border-t border-stone-100 p-4">
        {!match && (
          <button
            onClick={onSendContact}
            disabled={contactCredits <= 0}
            className={`w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              contactCredits > 0
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Mail size={16} />
            {contactCredits > 0 ? '연락 보내기' : '연락 보내기 횟수 부족'}
          </button>
        )}

        {match?.status === 'pending' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-stone-500 py-1">
              <Clock size={14} />
              <span className="text-sm">상대 수락 대기 중</span>
            </div>
            <button
              onClick={onAccept}
              className="w-full h-9 rounded-xl border border-stone-200 text-xs text-stone-500 font-medium"
            >
              [개발용] 수락 시뮬레이션
            </button>
          </div>
        )}

        {match?.status === 'accepted' && chat && (
          <Link href={`/chat/${chat.id}`}>
            <button className="w-full h-11 rounded-xl bg-coral-500 text-white text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              채팅하기
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

function PendingCard({
  profile,
  match,
  onAccept,
}: {
  profile: DummyProfile
  match: Match
  onAccept: () => void
}) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 mb-3">
      <ProfileAvatar profile={profile} size={48} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-stone-900">{profile.name}, {profile.age}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={12} className="text-stone-400" />
          <span className="text-xs text-stone-400">수락 대기 중</span>
        </div>
      </div>
      <button
        onClick={onAccept}
        className="h-9 px-4 bg-stone-100 text-stone-600 rounded-xl text-xs font-medium"
      >
        수락 시뮬레이션
      </button>
    </div>
  )
}
