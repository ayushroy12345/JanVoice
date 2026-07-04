import { geminiModel } from '@/config/gemini'
import type { AIAnalysis } from '@/types'

const SYSTEM_PROMPT = `You are JanVoice AI, a governance assistant for Indian Members of Parliament.
Analyze citizen submissions and return a JSON object with these fields:
- title: Short descriptive title (max 10 words)
- category: One of [Infrastructure, Healthcare, Education, Water, Electricity, Roads, Sanitation, Agriculture, Public Safety, Housing, Social Welfare, Environment, Sports, Culture, Other]
- summary: One-line summary (max 20 words)
- priority: One of [Low, Medium, High, Critical]
- urgency: Short urgency description
- sentiment: One of [positive, neutral, negative]
- department: Most relevant government department
- recommendedAction: Brief recommended action (max 15 words)
- estimatedImpact: Brief impact description (max 15 words)

Return ONLY valid JSON, no markdown, no backticks.`

export async function analyzeSubmission(description: string, type?: string): Promise<AIAnalysis> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return getFallbackAnalysis(description, type)
    }

    const prompt = `${SYSTEM_PROMPT}\n\nSubmission type: ${type || 'general'}\nDescription: ${description}`
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    const analysis: AIAnalysis = JSON.parse(cleaned)
    return analysis
  } catch (error) {
    console.error('Gemini analysis failed, using fallback:', error)
    return getFallbackAnalysis(description, type)
  }
}

function getFallbackAnalysis(description: string, type?: string): AIAnalysis {
  const lower = description.toLowerCase()
  let category = 'Other'
  let department = 'General Administration'
  let priority: AIAnalysis['priority'] = 'Medium'

  if (lower.includes('road') || lower.includes('bridge') || lower.includes('pothole')) {
    category = 'Roads'; department = 'PWD'; priority = 'High'
  } else if (lower.includes('water') || lower.includes('pipe') || lower.includes('drinking')) {
    category = 'Water'; department = 'Water Supply Department'; priority = 'High'
  } else if (lower.includes('electricity') || lower.includes('power') || lower.includes('light')) {
    category = 'Electricity'; department = 'Electricity Board'; priority = 'High'
  } else if (lower.includes('health') || lower.includes('hospital') || lower.includes('ambulance') || lower.includes('clinic')) {
    category = 'Healthcare'; department = 'Health Department'; priority = 'Critical'
  } else if (lower.includes('school') || lower.includes('education') || lower.includes('college') || lower.includes('library')) {
    category = 'Education'; department = 'Education Department'; priority = 'Medium'
  } else if (lower.includes('garbage') || lower.includes('clean') || lower.includes('drain') || lower.includes('sanitation')) {
    category = 'Sanitation'; department = 'Municipal Corporation'; priority = 'High'
  } else if (lower.includes('agriculture') || lower.includes('farmer') || lower.includes('crop')) {
    category = 'Agriculture'; department = 'Agriculture Department'; priority = 'Medium'
  } else if (lower.includes('sports') || lower.includes('ground') || lower.includes('play')) {
    category = 'Sports'; department = 'Sports Department'; priority = 'Low'
  } else if (lower.includes('crime') || lower.includes('safety') || lower.includes('police') || lower.includes('security')) {
    category = 'Public Safety'; department = 'Police Department'; priority = 'Critical'
  }

  if (type === 'help') priority = 'High'
  if (type === 'invite') { category = 'Culture'; department = 'Cultural Affairs'; priority = 'Low' }

  return {
    title: `${description.split(' ').slice(0, 6).join(' ')}...`,
    category,
    summary: description.length > 100 ? description.slice(0, 100) + '...' : description,
    priority,
    urgency: priority === 'Critical' ? 'Immediate attention required' : priority === 'High' ? 'Needs early action' : 'Standard handling',
    sentiment: lower.includes('thank') || lower.includes('good') || lower.includes('great') ? 'positive' : 'negative',
    department,
    recommendedAction: `Review and process ${category.toLowerCase()} issue`,
    estimatedImpact: `Addresses ${category.toLowerCase()} concern for citizens`,
  }
}

export async function generateAIBrief(stats: { totalInputs: number; categories: Record<string, number>; topLocation: string }): Promise<string> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return generateFallbackBrief(stats)
    }

    const prompt = `You are JanVoice AI. Generate a brief daily summary for an MP based on these stats:
Total citizen inputs: ${stats.totalInputs}
Categories: ${JSON.stringify(stats.categories)}
Most mentioned location: ${stats.topLocation}

Write 3-4 lines as a personal briefing. Be direct and actionable. Use Indian context.`

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch {
    return generateFallbackBrief(stats)
  }
}

function generateFallbackBrief(stats: { totalInputs: number; categories: Record<string, number>; topLocation: string }): string {
  const topCat = Object.entries(stats.categories).sort((a, b) => b[1] - a[1])[0]
  return `Today ${stats.totalInputs} citizens reached out. The biggest concern is ${topCat?.[0] || 'various issues'}${stats.topLocation !== 'Unknown' ? ` affecting ${stats.topLocation}` : ''}. Recommended priority: Address ${topCat?.[0]?.toLowerCase() || 'community'} concerns first.`
}

export async function getAIResponse(query: string, context: string): Promise<string> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return getFallbackAIResponse(query, context)
    }

    const prompt = `You are JanVoice AI, a governance assistant for an Indian MP.
Context from database:\n${context}\n\nMP Question: ${query}\n\nAnswer concisely and helpfully. Be specific and actionable.`

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch {
    return getFallbackAIResponse(query, context)
  }
}

function parseContext(context: string) {
  const totalMatch = context.match(/Total submissions: (\d+)/)
  const casesMatch = context.match(/Community cases: (\d+)/)
  const submissions = context.match(/\[([^\]]+)\]\s+([^\(]+)\(([^\)]+)\)\s*-\s*(\w+)/g) || []

  return {
    total: totalMatch ? parseInt(totalMatch[1]) : 0,
    cases: casesMatch ? parseInt(casesMatch[1]) : 0,
    parsed: submissions.map(s => {
      const parts = s.match(/\[([^\]]+)\]\s+([^\(]+)\(([^\)]+)\)\s*-\s*(\w+)/)
      if (!parts) return null
      return { category: parts[1], title: parts[2].trim(), location: parts[3].trim(), priority: parts[4] }
    }).filter(Boolean) as { category: string; title: string; location: string; priority: string }[],
  }
}

function getFallbackAIResponse(query: string, context: string): string {
  const data = parseContext(context)
  const lower = query.toLowerCase()

  if (data.parsed.length === 0) {
    return 'No citizen submissions have been received yet. Once citizens start submitting reports, I will be able to provide data-driven insights and recommendations.'
  }

  const categories = data.parsed.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {})

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]
  const criticalCount = data.parsed.filter(s => s.priority === 'Critical').length
  const locations = [...new Set(data.parsed.map(s => s.location).filter(l => l !== 'Not specified'))]

  if (lower.includes('focus') || lower.includes('today') || lower.includes('priority')) {
    const lines = [`Based on your constituency data:`, `Total submissions: ${data.total}`]
    if (topCategory) lines.push(`Biggest concern: ${topCategory[0]} (${topCategory[1]} reports)`)
    if (criticalCount > 0) lines.push(`Critical issues needing immediate attention: ${criticalCount}`)
    if (locations.length > 0) lines.push(`Active locations: ${locations.slice(0, 3).join(', ')}`)
    lines.push(`Recommended: Address ${topCategory?.[0]?.toLowerCase() || 'community'} issues first.`)
    return lines.join('\n')
  }

  if (lower.includes('village') || lower.includes('area') || lower.includes('location') || lower.includes('where')) {
    if (locations.length === 0) return 'Location data is not available for current submissions. Please encourage citizens to provide location details.'
    const locationCounts = data.parsed.filter(s => s.location !== 'Not specified').reduce<Record<string, number>>((acc, s) => {
      acc[s.location] = (acc[s.location] || 0) + 1
      return acc
    }, {})
    const sorted = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])
    return `Reports by location:\n${sorted.map(([loc, count]) => `- ${loc}: ${count} report(s)`).join('\n')}\n\nMost active: ${sorted[0][0]} with ${sorted[0][1]} reports.`
  }

  if (lower.includes('health') || lower.includes('medical') || lower.includes('hospital')) {
    const health = data.parsed.filter(s => s.category === 'Healthcare')
    if (health.length === 0) return 'No healthcare-related submissions found in the current data.'
    return `Healthcare submissions: ${health.length}\n${health.map(s => `- ${s.title} (${s.location}, ${s.priority})`).join('\n')}\n\nRecommended: Review medical infrastructure and ambulance services in affected areas.`
  }

  if (lower.includes('demand') || lower.includes('want') || lower.includes('need') || lower.includes('top')) {
    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1])
    return `Top citizen concerns:\n${sorted.map(([cat, count], i) => `${i + 1}. ${cat}: ${count} report(s)`).join('\n')}\n\n${criticalCount > 0 ? `Critical alerts: ${criticalCount}` : 'No critical alerts currently.'}`
  }

  if (lower.includes('department') || lower.includes('dept') || lower.includes('which dept')) {
    const depts = data.parsed.reduce<Record<string, number>>((acc, s) => {
      const dept = s.category === 'Roads' ? 'PWD' : s.category === 'Water' ? 'Water Supply' : s.category === 'Healthcare' ? 'Health Dept' : s.category === 'Electricity' ? 'Electricity Board' : s.category === 'Education' ? 'Education Dept' : 'Other'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {})
    const sorted = Object.entries(depts).sort((a, b) => b[1] - a[1])
    return `Department workload distribution:\n${sorted.map(([d, c]) => `- ${d}: ${c} pending`).join('\n')}\n\nMost loaded: ${sorted[0][0]}`
  }

  return `Here is your constituency snapshot:\n• ${data.total} total submissions\n• ${data.cases} community cases grouped\n• ${criticalCount} critical issues\n• Top category: ${topCategory?.[0] || 'N/A'}\n• Areas: ${locations.slice(0, 3).join(', ') || 'N/A'}\n\nWhat specific aspect would you like to explore?`
}
