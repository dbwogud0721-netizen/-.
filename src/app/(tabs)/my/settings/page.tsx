'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'

export default function SettingsPage() {
  const router = useRouter()
  const [showResetModal, setShowResetModal] = useState(false)

  const handleReset = () => {
    localStorage.clear()
    router.replace('/onboarding')
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header title="설정" showBack />
      <div className="pt-14 px-5 pb-10 space-y-4 animate-fade-in">
        <div className="mt-4 bg-white rounded-2xl overflow-hidden">
          <SettingRow label="알림 설정" sub="준비 중" />
          <SettingRow label="개인정보 처리방침" sub="" />
          <SettingRow label="서비스 이용약관" sub="" />
          <SettingRow label="버전 정보" sub="0.1.0 (MVP)" noArrow />
        </div>

        <div className="bg-white rounded-2xl overflow-hidden">
          <SettingRow label="신고/차단 내역" sub="" />
          <SettingRow label="계정 탈퇴" sub="" danger />
        </div>

        <button
          onClick={() => setShowResetModal(true)}
          className="w-full h-12 border-2 border-red-200 rounded-2xl text-sm font-medium text-red-500"
        >
          앱 초기화 (테스트용)
        </button>
      </div>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="앱 초기화"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-stone-700">모든 데이터가 삭제되고 온보딩부터 다시 시작해요. 되돌릴 수 없어요.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowResetModal(false)}
            className="flex-1 h-12 border border-stone-200 rounded-xl text-sm font-medium text-stone-700"
          >
            취소
          </button>
          <button
            onClick={handleReset}
            className="flex-1 h-12 bg-red-500 rounded-xl text-sm font-semibold text-white"
          >
            초기화
          </button>
        </div>
      </Modal>
    </div>
  )
}

function SettingRow({
  label,
  sub,
  danger,
  noArrow,
}: {
  label: string
  sub: string
  danger?: boolean
  noArrow?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b last:border-0 border-stone-50">
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-stone-900'}`}>{label}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
      {!noArrow && <ChevronRight size={16} className="text-stone-300" />}
    </div>
  )
}
