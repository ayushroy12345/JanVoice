export type SubmissionType = 'problem' | 'suggestion' | 'invite' | 'help'

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export type Sentiment = 'positive' | 'neutral' | 'negative'

export type SubmissionStatus = 'pending' | 'taken_charge' | 'in_progress' | 'resolved'

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Pending Review',
  taken_charge: 'Taken Charge',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export const STATUS_FLOW: SubmissionStatus[] = ['pending', 'taken_charge', 'in_progress', 'resolved']

export interface Citizen {
  id: string
  phone: string
  createdAt: string
}

export interface Submission {
  id: string
  citizenId: string
  citizenPhone: string
  type: SubmissionType
  description: string
  imageUrl: string | null
  location: string
  aiTitle: string
  aiCategory: string
  aiSummary: string
  priority: Priority
  aiSentiment: Sentiment
  department: string
  recommendedAction: string
  estimatedImpact: string
  status: SubmissionStatus
  createdAt: string
}

export interface CommunityCase {
  id: string
  title: string
  category: string
  location: string
  reportCount: number
  priority: Priority
  summary: string
  recommendedAction: string
  submissionIds: string[]
  createdAt: string
}

export interface AIAnalysis {
  title: string
  category: string
  summary: string
  priority: Priority
  urgency: string
  sentiment: Sentiment
  department: string
  recommendedAction: string
  estimatedImpact: string
}

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface DashboardStats {
  totalInputs: number
  communityCases: number
  criticalIssues: number
  resolvedCases: number
  aiBrief: string
}
