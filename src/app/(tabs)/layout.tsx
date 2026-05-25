'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import TabBar from '@/components/layout/TabBar'
import { profileStorage } from '@/lib/storage'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!profileStorage.exists()) {
      router.replace('/onboarding')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-cream">
      <main className="pb-16">{children}</main>
      <TabBar />
    </div>
  )
}
