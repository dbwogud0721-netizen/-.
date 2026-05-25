'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profileStorage } from '@/lib/storage'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    if (profileStorage.exists()) {
      router.replace('/home')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
    </div>
  )
}
