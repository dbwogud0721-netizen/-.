/**
 * AI Service - Mock implementation for MVP.
 * Replace with OpenAI API calls when ready.
 * All functions return Promise<string> to match future async pattern.
 */

import { AI_FEEDBACK_BY_MOOD } from './constants'
import type { Mood, Journal, QuestCompletion } from './types'

export async function getJournalFeedback(mood: Mood, content: string): Promise<string> {
  // TODO: Replace with OpenAI call
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4o-mini',
  //   messages: [{ role: 'user', content: `...` }],
  // })

  await new Promise((r) => setTimeout(r, 500)) // simulate latency
  const feedbacks = AI_FEEDBACK_BY_MOOD[mood] ?? ['오늘도 기록했네요. 잘했어요.']
  return feedbacks[Math.floor(Math.random() * feedbacks.length)]
}

export async function getQuestRecommendation(mood: Mood): Promise<string[]> {
  // TODO: Replace with AI-based recommendation
  await new Promise((r) => setTimeout(r, 300))

  const moodToQuests: Record<string, string[]> = {
    '좋아요': ['daily-walk', 'weekly-exercise', 'life-photo'],
    '평온해요': ['weekly-read', 'weekly-meditate', 'daily-compliment'],
    '멍해요': ['daily-water', 'daily-meal', 'weekly-meditate'],
    '외로워요': ['weekly-friend', 'daily-compliment', 'weekly-cafe'],
    '슬퍼요': ['daily-water', 'weekly-meditate', 'daily-meal'],
    '화나요': ['daily-walk', 'weekly-exercise', 'weekly-clean'],
    '불안해요': ['weekly-meditate', 'daily-no-sns', 'daily-compliment'],
  }

  return moodToQuests[mood] ?? ['daily-water', 'daily-walk', 'daily-compliment']
}

export async function getProfileSummary(completedCount: number, streakDays: number): Promise<string> {
  // TODO: Replace with AI-based summary
  await new Promise((r) => setTimeout(r, 200))

  const summaries = [
    '조금씩 나를 돌보는 중.',
    '매일 조금씩, 나를 다시 만나고 있어요.',
    '회복하는 사람의 하루하루.',
    '천천히, 그래도 앞으로.',
    `${streakDays}일째 나를 위한 시간을 만들고 있어요.`,
    `${completedCount}개의 작은 약속을 지켜온 사람.`,
  ]

  return summaries[Math.floor(Math.random() * summaries.length)]
}

export async function getWeeklyReport(journals: Journal[], completions: QuestCompletion[]): Promise<string> {
  // TODO: Replace with AI-based weekly summary
  await new Promise((r) => setTimeout(r, 400))

  const reports = [
    '이번 주도 잘 버텼어요. 눈에 보이지 않아도, 분명히 나아지고 있어요.',
    `${completions.length}개의 퀘스트를 완료했네요. 작은 것들이 쌓여가고 있어요.`,
    '기록한다는 것 자체가 나를 포기하지 않겠다는 의미예요.',
    '이번 주 감정이 다양했네요. 그만큼 많이 느끼며 살고 있다는 거예요.',
  ]

  return reports[Math.floor(Math.random() * reports.length)]
}
