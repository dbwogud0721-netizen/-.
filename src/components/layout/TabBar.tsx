'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, Users, BookOpen, User } from 'lucide-react'

const tabs = [
  { href: '/home', icon: Home, label: '홈' },
  { href: '/quest', icon: Target, label: '퀘스트' },
  { href: '/match', icon: Users, label: '매칭' },
  { href: '/journal', icon: BookOpen, label: '일기' },
  { href: '/my', icon: User, label: '마이' },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-stone-100 max-w-md mx-auto">
      <div className="flex h-full">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            >
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                isActive ? 'bg-coral-50' : ''
              }`}>
                <Icon
                  size={20}
                  className={isActive ? 'text-coral-500' : 'text-stone-400'}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
              </div>
              <span className={`text-[9px] font-bold ${isActive ? 'text-coral-500' : 'text-stone-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
