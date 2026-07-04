import type { Submission, SubmissionType, SubmissionStatus, Priority, Sentiment, AIAnalysis } from '@/types'
import { analyzeSubmission } from './ai'
import { supabase } from '@/config/supabase'

const STORAGE_KEY = 'janvoice_submissions'

const hasSupabase = () => Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

function getLocalSubmissions(): Submission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocalSubmissions(submissions: Submission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
}

export function getCitizenPhone(citizenId: string): string {
  try {
    const data = localStorage.getItem('janvoice_citizen')
    if (data) {
      const citizen = JSON.parse(data)
      return citizen.phone || 'Unknown'
    }
  } catch {}
  return 'Unknown'
}

export async function createSubmission(
  citizenId: string,
  citizenPhone: string,
  type: SubmissionType,
  description: string,
  imageUrl: string | null,
  location: string
): Promise<Submission> {
  const analysis: AIAnalysis = await analyzeSubmission(description, type)

  const submission: Submission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    citizenId,
    citizenPhone,
    type,
    description,
    imageUrl,
    location,
    aiTitle: analysis.title,
    aiCategory: analysis.category,
    aiSummary: analysis.summary,
    priority: analysis.priority as Priority,
    aiSentiment: analysis.sentiment as Sentiment,
    department: analysis.department,
    recommendedAction: analysis.recommendedAction,
    estimatedImpact: analysis.estimatedImpact,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  if (hasSupabase()) {
    try {
      const { error } = await supabase.from('submissions').insert({
        citizen_id: citizenId,
        citizen_phone: citizenPhone,
        type,
        description,
        image_url: imageUrl,
        location,
        ai_title: analysis.title,
        ai_category: analysis.category,
        ai_summary: analysis.summary,
        priority: analysis.priority,
        ai_sentiment: analysis.sentiment,
        department: analysis.department,
        recommended_action: analysis.recommendedAction,
        estimated_impact: analysis.estimatedImpact,
        status: 'pending',
      })
      if (!error) return submission
      console.warn('Supabase insert failed, falling back to localStorage:', error)
    } catch (e) {
      console.warn('Supabase error, falling back to localStorage:', e)
    }
  }

  const submissions = getLocalSubmissions()
  submissions.unshift(submission)
  saveLocalSubmissions(submissions)
  return submission
}

export async function getCitizenSubmissions(citizenId: string): Promise<Submission[]> {
  if (hasSupabase()) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false })
      if (!error && data) {
        return data.map(mapRowToSubmission)
      }
    } catch {}
  }
  return getLocalSubmissions().filter(s => s.citizenId === citizenId)
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  if (hasSupabase()) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) return mapRowToSubmission(data)
    } catch {}
  }
  return getLocalSubmissions().find(s => s.id === id)
}

export async function getAllSubmissions(): Promise<Submission[]> {
  if (hasSupabase()) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) return data.map(mapRowToSubmission)
    } catch {}
  }
  return getLocalSubmissions()
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  if (hasSupabase()) {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id)
      if (!error) return
    } catch {}
  }

  const submissions = getLocalSubmissions()
  const idx = submissions.findIndex(s => s.id === id)
  if (idx !== -1) {
    submissions[idx].status = status
    saveLocalSubmissions(submissions)
  }
}

function mapRowToSubmission(row: any): Submission {
  return {
    id: row.id,
    citizenId: row.citizen_id,
    citizenPhone: row.citizen_phone || 'Unknown',
    type: row.type,
    description: row.description,
    imageUrl: row.image_url,
    location: row.location || '',
    aiTitle: row.ai_title || '',
    aiCategory: row.ai_category || '',
    aiSummary: row.ai_summary || '',
    priority: row.priority || 'Medium',
    aiSentiment: row.ai_sentiment || 'neutral',
    department: row.department || '',
    recommendedAction: row.recommended_action || '',
    estimatedImpact: row.estimated_impact || '',
    status: row.status || 'pending',
    createdAt: row.created_at,
  }
}
