'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
}

export default function Header({ title, showBack = false, onBack, right }: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-stone-100 flex items-center justify-between px-4 max-w-md mx-auto">
      <div className="w-10 flex items-center">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors -ml-1"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} className="text-stone-700" />
          </button>
        )}
      </div>

      <h1 className="text-base font-semibold text-stone-900 absolute left-1/2 -translate-x-1/2">
        {title}
      </h1>

      <div className="w-10 flex items-center justify-end">
        {right}
      </div>
    </header>
  )
}
