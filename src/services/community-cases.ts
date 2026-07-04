import type { CommunityCase, Submission, Priority } from '@/types'
import { getAllSubmissions } from './submission'

const STORAGE_KEY = 'janvoice_community_cases'

function getCases(): CommunityCase[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveCases(cases: CommunityCase[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
}

function normalizeLocation(location: string): string {
  return location.trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function rebuildCommunityCases(): Promise<CommunityCase[]> {
  const submissions = await getAllSubmissions()
  const grouped = new Map<string, { submissions: Submission[]; location: string; category: string }>()

  for (const sub of submissions) {
    if (sub.status === 'resolved') continue
    const loc = normalizeLocation(sub.location)
    const key = `${sub.aiCategory}_${loc}`

    if (grouped.has(key)) {
      grouped.get(key)!.submissions.push(sub)
    } else {
      grouped.set(key, { submissions: [sub], location: sub.location, category: sub.aiCategory })
    }
  }

  const cases: CommunityCase[] = []

  for (const [, group] of grouped) {
    const subs = group.submissions
    const priorities = subs.map(s => s.priority)
    const priorityOrder: Priority[] = ['Critical', 'High', 'Medium', 'Low']
    const topPriority: Priority = priorityOrder.find(p => priorities.includes(p)) || 'Low'

    const allTitles = subs.map(s => s.aiTitle)
    const title = allTitles[0] || `${group.category} Issue`

    cases.push({
      id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      title,
      category: group.category,
      location: group.location,
      reportCount: subs.length,
      priority: topPriority,
      summary: `${subs.length} report(s) about ${group.category.toLowerCase()} in ${group.location}. Most recent: ${subs[0].aiSummary}`,
      recommendedAction: subs[0]?.recommendedAction || 'Review community concern',
      submissionIds: subs.map(s => s.id),
      createdAt: subs[0]?.createdAt || new Date().toISOString(),
    })
  }

  saveCases(cases)
  return cases.sort((a, b) => {
    const order: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }
    return (order[b.priority] || 0) - (order[a.priority] || 0)
  })
}

export function getCommunityCases(): CommunityCase[] {
  return getCases()
}

export function getCaseById(id: string): CommunityCase | undefined {
  return getCases().find(c => c.id === id)
}
