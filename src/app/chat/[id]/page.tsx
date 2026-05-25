'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Send, Image as ImageIcon, ChevronLeft, MoreVertical, X } from 'lucide-react'
import { chatStorage, profileStorage } from '@/lib/storage'
import { calculateBreakupDays, getLevelConfig, formatTime } from '@/lib/utils'
import { DUMMY_PROFILES, LEVELS } from '@/lib/constants'
import type { Chat, Message, DummyProfile } from '@/lib/types'
import Modal from '@/components/ui/Modal'

const BOT_REPLIES = [
  '안녕하세요. 먼저 연락해주셔서 고마워요.',
  '저도 요즘 비슷한 시간을 보내고 있어요.',
  '천천히 이야기 나눠요.',
]

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [chat, setChat] = useState<Chat | null>(null)
  const [targetProfile, setTargetProfile] = useState<DummyProfile | null>(null)
  const [myId, setMyId] = useState('')
  const [text, setText] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [mounted, setMounted] = useState(false)
  const botReplied = useRef(false)

  const reload = () => {
    const c = chatStorage.getById(id)
    if (!c) return
    chatStorage.markRead(id)
    setChat(chatStorage.getById(id))
  }

  useEffect(() => {
    const profile = profileStorage.get()
    if (!profile) { router.replace('/onboarding'); return }
    setMyId(profile.id)

    const c = chatStorage.getById(id)
    if (!c) { router.back(); return }

    const dp = DUMMY_PROFILES.find((p) => p.id === c.targetProfileId)
    setTargetProfile(dp ?? null)

    chatStorage.markRead(id)
    setChat(chatStorage.getById(id))
    setMounted(true)
  }, [id, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages.length])

  const handleSendText = () => {
    if (!text.trim()) return
    chatStorage.sendMessage(id, {
      senderId: myId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    })
    setText('')
    reload()

    // One-time bot reply
    if (!botReplied.current) {
      botReplied.current = true
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)]
      setTimeout(() => {
        chatStorage.addBotMessage(id, reply)
        reload()
      }, 1500)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      chatStorage.sendMessage(id, {
        senderId: myId,
        image: ev.target?.result as string,
        createdAt: new Date().toISOString(),
      })
      reload()
    }
    reader.readAsDataURL(file)
  }

  if (!mounted || !chat || !targetProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  const breakupDays = calculateBreakupDays(targetProfile.breakupDate)
  const levelConfig = LEVELS.find((l) => l.level === targetProfile.level) ?? LEVELS[0]

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Chat header */}
      <div className="bg-white border-b border-stone-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1">
          <ChevronLeft size={22} className="text-stone-700" />
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
          style={{ backgroundColor: targetProfile.avatarColor }}
        >
          {targetProfile.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-stone-900 leading-tight">
            {targetProfile.name}, {targetProfile.age}
          </p>
          <p className="text-xs text-stone-400">
            이별 {breakupDays}일째 · Lv.{levelConfig.level} {levelConfig.name}
          </p>
        </div>
        <button
          onClick={() => setShowMenu(true)}
          className="w-9 h-9 flex items-center justify-center"
        >
          <MoreVertical size={20} className="text-stone-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chat.messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-stone-400">
              {targetProfile.name}님과 연결됐어요.
            </p>
            <p className="text-xs text-stone-300 mt-1">먼저 인사를 건네봐요.</p>
          </div>
        )}

        {chat.messages.map((msg, idx) => {
          const isMe = msg.senderId === myId
          const showTime =
            idx === chat.messages.length - 1 ||
            chat.messages[idx + 1]?.senderId !== msg.senderId

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMe && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mb-1"
                  style={{ backgroundColor: targetProfile.avatarColor }}
                >
                  {targetProfile.name.charAt(0)}
                </div>
              )}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[72%]`}>
                {msg.image ? (
                  <img src={msg.image} alt="사진" className="rounded-2xl max-w-full object-cover max-h-60" />
                ) : (
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-stone-900 text-white rounded-br-sm'
                        : 'bg-white text-stone-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
                {showTime && (
                  <p className="text-[10px] text-stone-400 mt-1 px-1">
                    {formatTime(msg.createdAt)}
                    {isMe && <span className="ml-1">{msg.read ? '읽음' : ''}</span>}
                  </p>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-stone-100 px-4 py-3 pb-safe flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0"
        >
          <ImageIcon size={18} className="text-stone-500" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="flex-1 bg-stone-100 rounded-2xl px-4 py-2.5 flex items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendText()
              }
            }}
            placeholder="메시지를 입력해요."
            rows={1}
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none resize-none max-h-24 leading-relaxed"
          />
        </div>
        <button
          onClick={handleSendText}
          disabled={!text.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            text.trim() ? 'bg-stone-900' : 'bg-stone-200'
          }`}
        >
          <Send size={18} className={text.trim() ? 'text-white' : 'text-stone-400'} />
        </button>
      </div>

      {/* Options menu */}
      <Modal isOpen={showMenu} onClose={() => setShowMenu(false)}>
        <div className="space-y-2">
          <button
            onClick={() => { setShowMenu(false); setShowReport(true) }}
            className="w-full h-12 rounded-xl border border-stone-200 text-sm font-medium text-stone-700"
          >
            신고하기
          </button>
          <button
            onClick={() => { setShowMenu(false) }}
            className="w-full h-12 rounded-xl border border-red-200 text-sm font-medium text-red-500"
          >
            차단하기
          </button>
        </div>
      </Modal>

      {/* Report modal */}
      <Modal isOpen={showReport} onClose={() => setShowReport(false)} title="신고하기">
        <p className="text-sm text-stone-600 mb-4">신고 기능은 준비 중이에요. 불편한 경험이 있으시면 설정에서 문의해주세요.</p>
        <button
          onClick={() => setShowReport(false)}
          className="w-full h-12 bg-stone-900 text-white rounded-xl text-sm font-semibold"
        >
          확인
        </button>
      </Modal>
    </div>
  )
}
