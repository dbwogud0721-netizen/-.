'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { chatStorage, profileStorage } from '@/lib/storage'
import { DUMMY_PROFILES } from '@/lib/constants'
import { getTimeAgo } from '@/lib/utils'
import type { Chat } from '@/lib/types'

export default function ChatListPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!profileStorage.exists()) { router.replace('/onboarding'); return }
    setChats(chatStorage.getAll())
    setMounted(true)
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="px-5 pt-6 pb-4 border-b border-stone-100 bg-white">
        <h1 className="text-xl font-semibold text-stone-900">채팅</h1>
        <p className="text-sm text-stone-400 mt-0.5">연결된 분들과 대화해요.</p>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
          <MessageCircle size={40} className="text-stone-200 mb-4" />
          <p className="text-base font-medium text-stone-500">아직 대화가 없어요.</p>
          <p className="text-sm text-stone-400 mt-1">매칭 탭에서 연락을 보내보세요.</p>
          <Link href="/match">
            <button className="mt-6 h-11 px-6 bg-stone-900 text-white rounded-xl text-sm font-medium">
              매칭 보러가기
            </button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 bg-white">
          {chats.map((chat) => {
            const dummyProfile = DUMMY_PROFILES.find((p) => p.id === chat.targetProfileId)
            if (!dummyProfile) return null

            return (
              <Link key={chat.id} href={`/chat/${chat.id}`}>
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                    style={{ backgroundColor: dummyProfile.avatarColor }}
                  >
                    {dummyProfile.name.charAt(0)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-base font-semibold text-stone-900">{dummyProfile.name}</p>
                      <p className="text-xs text-stone-400">
                        {chat.lastMessageAt ? getTimeAgo(chat.lastMessageAt) : ''}
                      </p>
                    </div>
                    <p className="text-sm text-stone-500 truncate">
                      {chat.lastMessage || '대화를 시작해보세요.'}
                    </p>
                  </div>
                  {/* Unread */}
                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-coral-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">{chat.unreadCount}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
