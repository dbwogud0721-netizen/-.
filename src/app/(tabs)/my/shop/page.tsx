'use client'

import { useState } from 'react'
import { Mail, Heart, Star, Eye, ShoppingBag, Lock } from 'lucide-react'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import { SHOP_ITEMS } from '@/lib/constants'

const ICON_MAP: Record<string, React.ReactNode> = {
  mail: <Mail size={22} className="text-coral-500" />,
  heart: <Heart size={22} className="text-rose-400" />,
  star: <Star size={22} className="text-amber-400" />,
  eye: <Eye size={22} className="text-blue-500" />,
}

export default function ShopPage() {
  const [selectedItem, setSelectedItem] = useState<(typeof SHOP_ITEMS)[0] | null>(null)

  return (
    <div className="min-h-screen bg-cream">
      <Header title="상점" showBack />

      <div className="pt-14 px-5 pb-10 space-y-5 animate-fade-in">
        {/* Notice */}
        <div className="mt-4 bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <p className="text-xs text-stone-500 leading-relaxed">
            매칭 후 채팅은 항상 무료예요. 상점은 더 많은 기회를 위한 공간이에요.
          </p>
        </div>

        {/* How to earn free */}
        <div className="bg-white rounded-2xl p-5">
          <p className="text-sm font-semibold text-stone-900 mb-3">무료로 얻는 방법</p>
          <div className="space-y-3">
            <FreeRow icon="🎯" text="일일 퀘스트 3개 완료" reward="연락 보내기 +1" />
            <FreeRow icon="🏅" text="Lv.3 달성" reward="연락 보내기 +1" />
            <FreeRow icon="🏅" text="Lv.5 달성" reward="연락 보내기 +1 · 진심 카드 +1" />
            <FreeRow icon="🏅" text="Lv.8 달성" reward="연락 보내기 +1" />
          </div>
        </div>

        {/* Shop items */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-400">유료 아이템</p>
          {SHOP_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 text-left relative"
            >
              {'badge' in item && item.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-white bg-coral-500 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center flex-shrink-0">
                {ICON_MAP[item.icon]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-semibold text-stone-900">{item.price.toLocaleString()}원</p>
              </div>
            </button>
          ))}
        </div>

        {/* Note */}
        <p className="text-xs text-stone-400 text-center pb-4">
          현재 결제 기능은 준비 중이에요.
        </p>
      </div>

      {/* Purchase modal */}
      <Modal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name ?? ''}
      >
        {selectedItem && (
          <div>
            <p className="text-sm text-stone-600 mb-4">{selectedItem.description}</p>
            <div className="bg-stone-50 rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700">결제 금액</span>
              <span className="text-lg font-semibold text-stone-900">{selectedItem.price.toLocaleString()}원</span>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 mb-6 flex items-center gap-2">
              <Lock size={14} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">현재 결제 기능은 준비 중이에요. 퀘스트 완료로 무료로 얻어보세요.</p>
            </div>
            <button
              disabled
              className="w-full h-12 bg-stone-200 text-stone-400 rounded-xl text-sm font-semibold cursor-not-allowed"
            >
              준비 중
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

function FreeRow({ icon, text, reward }: { icon: string; text: string; reward: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-sm text-stone-700">{text}</p>
        <p className="text-xs text-coral-500 font-medium">{reward}</p>
      </div>
    </div>
  )
}
