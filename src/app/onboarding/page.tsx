'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Upload, X } from 'lucide-react'
import { profileStorage, progressStorage } from '@/lib/storage'
import { calculateAge, generateId, getTodayString } from '@/lib/utils'
import type { Gender, Vibe, RelationshipGoal, CurrentState, UserProfile } from '@/lib/types'

const TOTAL_STEPS = 10

type FormData = {
  gender: Gender | null
  name: string
  birthDate: string
  profileImage: string | null
  breakupDate: string
  preferredMinAge: string
  preferredMaxAge: string
  currentState: CurrentState | null
  preferredVibes: Vibe[]
  relationshipGoal: RelationshipGoal | null
  bio: string
}

const VIBES: Vibe[] = ['다정한', '차분한', '밝은', '자기관리하는', '공감 잘하는', '웃긴']
const STATES: CurrentState[] = ['멍하다', '외롭다', '다시 시작하고 싶다', '그냥 대화가 필요하다']
const GOALS: RelationshipGoal[] = ['가벼운 대화', '위로', '새로운 설렘', '진지한 관계']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    gender: null,
    name: '',
    birthDate: '',
    profileImage: null,
    breakupDate: '',
    preferredMinAge: '20',
    preferredMaxAge: '35',
    currentState: null,
    preferredVibes: [],
    relationshipGoal: null,
    bio: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const progress = (step / TOTAL_STEPS) * 100

  const canProceed = () => {
    switch (step) {
      case 1: return form.gender !== null
      case 2: return form.name.trim().length >= 2
      case 3: return form.birthDate !== ''
      case 4: return true // photo optional
      case 5: return form.breakupDate !== ''
      case 6: return parseInt(form.preferredMinAge) < parseInt(form.preferredMaxAge)
      case 7: return form.currentState !== null
      case 8: return form.preferredVibes.length > 0
      case 9: return form.relationshipGoal !== null
      case 10: return form.bio.trim().length >= 10
      default: return false
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    if (!form.gender || !form.currentState || !form.relationshipGoal) return

    const age = calculateAge(form.birthDate)
    const profile: UserProfile = {
      id: generateId(),
      name: form.name.trim(),
      gender: form.gender,
      birthDate: form.birthDate,
      age,
      profileImage: form.profileImage,
      height: null,
      job: '',
      location: '',
      breakupDate: form.breakupDate,
      bio: form.bio.trim(),
      interests: [],
      preferredMinAge: parseInt(form.preferredMinAge),
      preferredMaxAge: parseInt(form.preferredMaxAge),
      preferredVibes: form.preferredVibes,
      relationshipGoal: form.relationshipGoal,
      currentState: form.currentState,
      createdAt: new Date().toISOString(),
    }

    profileStorage.set(profile)

    const today = getTodayString()
    progressStorage.set({
      level: 1,
      xp: 0,
      streakDays: 1,
      lastStreakDate: today,
      contactCredits: 1,
      sincerityCards: 0,
      badges: [],
      lastDailyReset: today,
      lastWeeklyReset: today,
      dailyXPEarned: 0,
    })

    router.push('/home')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, profileImage: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const toggleVibe = (vibe: Vibe) => {
    setForm((f) => ({
      ...f,
      preferredVibes: f.preferredVibes.includes(vibe)
        ? f.preferredVibes.filter((v) => v !== vibe)
        : [...f.preferredVibes, vibe],
    }))
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-10">
        <div className="h-1 bg-stone-100">
          <div
            className="h-full bg-coral-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-6 px-6 pb-32">
        {/* Step indicator */}
        <div className="mt-4 mb-8">
          <p className="text-xs text-stone-400 font-medium">{step} / {TOTAL_STEPS}</p>
        </div>

        {/* Step content */}
        <div className="flex-1 animate-fade-in" key={step}>
          {step === 1 && (
            <StepWrapper title="안녕하세요." subtitle="성별을 알려주세요.">
              <div className="grid grid-cols-3 gap-3 mt-8">
                {(['male', 'female', 'other'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setForm((f) => ({ ...f, gender: g }))}
                    className={`h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                      form.gender === g
                        ? 'border-coral-500 bg-coral-50'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{g === 'male' ? '🙋‍♂️' : g === 'female' ? '🙋‍♀️' : '🙋'}</span>
                    <span className="text-sm font-medium text-stone-700">
                      {g === 'male' ? '남성' : g === 'female' ? '여성' : '기타'}
                    </span>
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {step === 2 && (
            <StepWrapper title="이름을 알려주세요." subtitle="앱에서 표시될 이름이에요.">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="이름 입력"
                maxLength={10}
                className="w-full h-14 bg-white border border-stone-200 rounded-2xl px-5 text-base text-stone-900 placeholder-stone-300 focus:outline-none focus:border-coral-400 transition-colors mt-8"
                autoFocus
              />
            </StepWrapper>
          )}

          {step === 3 && (
            <StepWrapper title={`${form.name}님은`} subtitle="언제 태어나셨나요?">
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full h-14 bg-white border border-stone-200 rounded-2xl px-5 text-base text-stone-900 focus:outline-none focus:border-coral-400 transition-colors mt-8"
              />
              {form.birthDate && (
                <p className="text-sm text-stone-500 mt-3 ml-1">
                  만 {calculateAge(form.birthDate)}세
                </p>
              )}
            </StepWrapper>
          )}

          {step === 4 && (
            <StepWrapper title="프로필 사진" subtitle="없어도 괜찮아요. 나중에 추가할 수 있어요.">
              <div className="mt-8 flex flex-col items-center">
                {form.profileImage ? (
                  <div className="relative">
                    <img
                      src={form.profileImage}
                      alt="프로필"
                      className="w-32 h-32 rounded-full object-cover border-2 border-stone-200"
                    />
                    <button
                      onClick={() => setForm((f) => ({ ...f, profileImage: null }))}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-stone-900 rounded-full flex items-center justify-center"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full bg-white border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-coral-400 transition-colors"
                  >
                    <Upload size={24} className="text-stone-400" />
                    <span className="text-xs text-stone-400">사진 선택</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {form.profileImage && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 text-sm text-coral-500 font-medium"
                  >
                    사진 변경
                  </button>
                )}
              </div>
            </StepWrapper>
          )}

          {step === 5 && (
            <StepWrapper
              title="이별한 날을 알려주세요."
              subtitle="이 날짜 기준으로 회복 일수가 계산돼요."
            >
              <input
                type="date"
                value={form.breakupDate}
                onChange={(e) => setForm((f) => ({ ...f, breakupDate: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-14 bg-white border border-stone-200 rounded-2xl px-5 text-base text-stone-900 focus:outline-none focus:border-coral-400 transition-colors mt-8"
              />
              <p className="text-xs text-stone-400 mt-3 ml-1">
                오늘 이별했어도 괜찮아요.
              </p>
            </StepWrapper>
          )}

          {step === 6 && (
            <StepWrapper title="어떤 나이대와" subtitle="대화하면 편한가요?">
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-stone-500 mb-2 block">최소 나이</label>
                    <input
                      type="number"
                      value={form.preferredMinAge}
                      onChange={(e) => setForm((f) => ({ ...f, preferredMinAge: e.target.value }))}
                      min={18}
                      max={60}
                      className="w-full h-12 bg-white border border-stone-200 rounded-xl px-4 text-base text-stone-900 focus:outline-none focus:border-coral-400 transition-colors text-center"
                    />
                  </div>
                  <span className="text-stone-400 mt-5">~</span>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-stone-500 mb-2 block">최대 나이</label>
                    <input
                      type="number"
                      value={form.preferredMaxAge}
                      onChange={(e) => setForm((f) => ({ ...f, preferredMaxAge: e.target.value }))}
                      min={18}
                      max={60}
                      className="w-full h-12 bg-white border border-stone-200 rounded-xl px-4 text-base text-stone-900 focus:outline-none focus:border-coral-400 transition-colors text-center"
                    />
                  </div>
                </div>
                <p className="text-sm text-stone-500 text-center">
                  {form.preferredMinAge}세 ~ {form.preferredMaxAge}세
                </p>
              </div>
            </StepWrapper>
          )}

          {step === 7 && (
            <StepWrapper title="요즘 어떤 상태인가요?" subtitle="솔직하게 골라주세요.">
              <div className="mt-8 space-y-3">
                {STATES.map((state) => (
                  <button
                    key={state}
                    onClick={() => setForm((f) => ({ ...f, currentState: state }))}
                    className={`w-full h-14 rounded-2xl px-5 text-left text-base font-medium border-2 transition-all ${
                      form.currentState === state
                        ? 'border-coral-500 bg-coral-50 text-coral-600'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {step === 8 && (
            <StepWrapper title="어떤 분위기의 사람이" subtitle="좋으세요? 여러 개 골라도 돼요.">
              <div className="mt-8 flex flex-wrap gap-3">
                {VIBES.map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => toggleVibe(vibe)}
                    className={`px-5 h-10 rounded-full text-sm font-medium border-2 transition-all ${
                      form.preferredVibes.includes(vibe)
                        ? 'border-coral-500 bg-coral-50 text-coral-600'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {step === 9 && (
            <StepWrapper title="지금 필요한 게" subtitle="뭔가요?">
              <div className="mt-8 space-y-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setForm((f) => ({ ...f, relationshipGoal: goal }))}
                    className={`w-full h-14 rounded-2xl px-5 text-left text-base font-medium border-2 transition-all ${
                      form.relationshipGoal === goal
                        ? 'border-coral-500 bg-coral-50 text-coral-600'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {step === 10 && (
            <StepWrapper
              title="마지막으로,"
              subtitle="나를 한 번 소개해볼까요? 짧아도 좋아요."
            >
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="요즘 어떻게 지내고 있는지, 어떤 사람인지 편하게 써주세요."
                maxLength={200}
                rows={5}
                className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 text-base text-stone-900 placeholder-stone-300 focus:outline-none focus:border-coral-400 transition-colors resize-none mt-8"
              />
              <p className="text-right text-xs text-stone-400 mt-2">
                {form.bio.length} / 200
              </p>
            </StepWrapper>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-8 pt-4 bg-cream">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full h-14 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${
            canProceed()
              ? 'bg-stone-900 text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {step === TOTAL_STEPS ? '시작하기' : '다음'}
          {step < TOTAL_STEPS && <ChevronRight size={18} />}
        </button>
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full h-10 text-sm text-stone-400 mt-2"
          >
            이전
          </button>
        )}
      </div>
    </div>
  )
}

function StepWrapper({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 leading-snug">{title}</h1>
      <p className="text-stone-500 mt-1 text-base">{subtitle}</p>
      {children}
    </div>
  )
}
