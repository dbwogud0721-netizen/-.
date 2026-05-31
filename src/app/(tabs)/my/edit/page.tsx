'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import Header from '@/components/layout/Header'
import { profileStorage } from '@/lib/storage'
import { calculateAge } from '@/lib/utils'
import type { UserProfile, Vibe, RelationshipGoal } from '@/lib/types'

const VIBES: Vibe[] = ['다정한', '차분한', '밝은', '자기관리하는', '공감 잘하는', '웃긴']
const GOALS: RelationshipGoal[] = ['가벼운 대화', '위로', '새로운 설렘', '진지한 관계']
const INTERESTS_SUGGESTIONS = ['독서', '운동', '요리', '영화', '음악', '여행', '사진', '카페', '게임', '산책', '요가', '글쓰기', '그림', '드라이브', '등산']

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    gender: 'male' as UserProfile['gender'],
    profileImage: null as string | null,
    height: '',
    job: '',
    location: '',
    breakupDate: '',
    bio: '',
    interests: [] as string[],
    preferredMinAge: '20',
    preferredMaxAge: '35',
    relationshipGoal: '가벼운 대화' as RelationshipGoal,
    preferredVibes: [] as Vibe[],
  })
  const [interestInput, setInterestInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const p = profileStorage.get()
    if (!p) { router.replace('/onboarding'); return }
    setProfile(p)
    setForm({
      name: p.name,
      birthDate: p.birthDate,
      gender: p.gender,
      profileImage: p.profileImage,
      height: p.height?.toString() ?? '',
      job: p.job,
      location: p.location,
      breakupDate: p.breakupDate,
      bio: p.bio,
      interests: p.interests,
      preferredMinAge: p.preferredMinAge.toString(),
      preferredMaxAge: p.preferredMaxAge.toString(),
      relationshipGoal: p.relationshipGoal,
      preferredVibes: p.preferredVibes,
    })
    setMounted(true)
  }, [router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm((f) => ({ ...f, profileImage: ev.target?.result as string }))
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

  const addInterest = (interest: string) => {
    const trimmed = interest.trim()
    if (!trimmed || form.interests.includes(trimmed) || form.interests.length >= 10) return
    setForm((f) => ({ ...f, interests: [...f.interests, trimmed] }))
    setInterestInput('')
  }

  const removeInterest = (interest: string) => {
    setForm((f) => ({ ...f, interests: f.interests.filter((i) => i !== interest) }))
  }

  const handleSave = async () => {
    if (!profile || saving) return
    setSaving(true)
    const updated: UserProfile = {
      ...profile,
      name: form.name.trim(),
      birthDate: form.birthDate,
      gender: form.gender,
      age: calculateAge(form.birthDate),
      profileImage: form.profileImage,
      height: form.height ? parseInt(form.height) : null,
      job: form.job.trim(),
      location: form.location.trim(),
      breakupDate: form.breakupDate,
      bio: form.bio.trim(),
      interests: form.interests,
      preferredMinAge: parseInt(form.preferredMinAge),
      preferredMaxAge: parseInt(form.preferredMaxAge),
      relationshipGoal: form.relationshipGoal,
      preferredVibes: form.preferredVibes,
    }
    profileStorage.set(updated)
    setSaving(false)
    router.back()
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-coral-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header
        title="내 정보 수정"
        showBack
        right={
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className={`text-sm font-semibold ${!saving && form.name.trim() ? 'text-coral-500' : 'text-stone-300'}`}
          >
            저장
          </button>
        }
      />

      <div className="pt-14 px-5 pb-32 space-y-6 animate-fade-in">
        {/* Profile photo */}
        <div className="flex flex-col items-center pt-6">
          {form.profileImage ? (
            <div className="relative">
              <img src={form.profileImage} alt="프로필" className="w-24 h-24 rounded-full object-cover border-2 border-stone-100" />
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
              className="w-24 h-24 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <Upload size={20} className="text-stone-400" />
              <span className="text-[10px] text-stone-400">사진</span>
            </div>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs text-coral-500 font-medium">
            {form.profileImage ? '사진 변경' : '사진 추가'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Basic info */}
        <Section title="기본 정보">
          <Field label="이름">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls}
              maxLength={10}
            />
          </Field>
          <Field label="생년월일">
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="성별">
            <div className="flex gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setForm((f) => ({ ...f, gender: g }))}
                  className={`flex-1 h-11 rounded-xl text-sm font-medium border-2 transition-all ${
                    form.gender === g ? 'border-coral-500 bg-coral-50 text-coral-600' : 'border-stone-200 bg-stone-50 text-stone-600'
                  }`}
                >
                  {g === 'male' ? '남성' : '여성'}
                </button>
              ))}
            </div>
          </Field>
          <Field label="키 (cm)">
            <input
              type="number"
              value={form.height}
              onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
              placeholder="선택사항"
              min={140}
              max={220}
              className={inputCls}
            />
          </Field>
          <Field label="직업">
            <input
              type="text"
              value={form.job}
              onChange={(e) => setForm((f) => ({ ...f, job: e.target.value }))}
              placeholder="선택사항"
              className={inputCls}
              maxLength={20}
            />
          </Field>
          <Field label="지역">
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="예: 서울 마포구"
              className={inputCls}
              maxLength={20}
            />
          </Field>
        </Section>

        {/* Recovery info */}
        <Section title="회복 정보">
          <Field label="이별한 날짜">
            <input
              type="date"
              value={form.breakupDate}
              onChange={(e) => setForm((f) => ({ ...f, breakupDate: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className={inputCls}
            />
          </Field>
        </Section>

        {/* Bio */}
        <Section title="자기소개">
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="나를 편하게 소개해봐요."
            rows={4}
            maxLength={200}
            className={`w-full bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-coral-100 resize-none`}
          />
        </Section>

        {/* Interests */}
        <Section title="관심사">
          <div className="flex flex-wrap gap-2 mb-3">
            {form.interests.map((i) => (
              <button
                key={i}
                onClick={() => removeInterest(i)}
                className="flex items-center gap-1 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-full"
              >
                {i} <X size={10} />
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInterest(interestInput)}
              placeholder="직접 입력 후 엔터"
              className={`flex-1 ${inputCls}`}
              maxLength={10}
            />
            <button
              onClick={() => addInterest(interestInput)}
              className="h-11 px-4 bg-stone-900 text-white rounded-xl text-sm font-medium"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_SUGGESTIONS.filter((s) => !form.interests.includes(s)).slice(0, 8).map((s) => (
              <button
                key={s}
                onClick={() => addInterest(s)}
                className="text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full"
              >
                + {s}
              </button>
            ))}
          </div>
        </Section>

        {/* Preferences */}
        <Section title="매칭 선호">
          <Field label="선호 나이">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={form.preferredMinAge}
                onChange={(e) => setForm((f) => ({ ...f, preferredMinAge: e.target.value }))}
                min={18}
                max={60}
                className={`flex-1 ${inputCls} text-center`}
              />
              <span className="text-stone-400">~</span>
              <input
                type="number"
                value={form.preferredMaxAge}
                onChange={(e) => setForm((f) => ({ ...f, preferredMaxAge: e.target.value }))}
                min={18}
                max={60}
                className={`flex-1 ${inputCls} text-center`}
              />
            </div>
          </Field>
          <Field label="원하는 분위기">
            <div className="flex flex-wrap gap-2">
              {VIBES.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleVibe(v)}
                  className={`px-4 h-9 rounded-full text-sm font-medium border-2 transition-all ${
                    form.preferredVibes.includes(v)
                      ? 'border-coral-500 bg-coral-50 text-coral-600'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>
          <Field label="관계 목적">
            <div className="space-y-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setForm((f) => ({ ...f, relationshipGoal: g }))}
                  className={`w-full h-11 rounded-xl text-sm font-medium border-2 text-left px-4 transition-all ${
                    form.relationshipGoal === g
                      ? 'border-coral-500 bg-coral-50 text-coral-600'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>
        </Section>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pb-8 pt-4 bg-cream">
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          className={`w-full h-14 rounded-2xl text-base font-semibold transition-all ${
            !saving && form.name.trim() ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}

const inputCls = 'w-full h-11 bg-stone-50 rounded-xl px-4 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-coral-100'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4">
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500">{label}</label>
      {children}
    </div>
  )
}
