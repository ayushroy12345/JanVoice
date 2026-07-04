import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare, Users, AlertTriangle, CheckCircle2,
  TrendingUp, ArrowUp, ArrowDown, Bot
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getAllSubmissions } from '@/services/submission'
import { rebuildCommunityCases, getCommunityCases } from '@/services/community-cases'
import { generateAIBrief } from '@/services/ai'

const greetings = ['Good Morning', 'Good Afternoon', 'Good Evening']

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalInputs: 0, communityCases: 0, criticalIssues: 0, resolvedCases: 0 })
  const [aiBrief, setAiBrief] = useState('')
  const [loading, setLoading] = useState(true)
  const hour = new Date().getHours()
  const greeting = greetings[hour < 12 ? 0 : hour < 17 ? 1 : 2]

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    const submissions = await getAllSubmissions()
    await rebuildCommunityCases()
    const cases = getCommunityCases()

    const totalInputs = submissions.length
    const communityCases = cases.length
    const criticalIssues = submissions.filter(s => s.priority === 'Critical' && s.status !== 'resolved').length
    const resolvedCases = submissions.filter(s => s.status === 'resolved').length

    setStats({ totalInputs, communityCases, criticalIssues, resolvedCases })

    const categories: Record<string, number> = {}
    submissions.forEach(s => {
      categories[s.aiCategory] = (categories[s.aiCategory] || 0) + 1
    })

    const locationCounts: Record<string, number> = {}
    submissions.forEach(s => {
      if (s.location && s.location !== 'Not specified') {
        locationCounts[s.location] = (locationCounts[s.location] || 0) + 1
      }
    })
    const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

    const brief = await generateAIBrief({ totalInputs, categories, topLocation })
    setAiBrief(brief)
    setLoading(false)
  }

  const statCards = [
    { icon: MessageSquare, label: 'Total Citizen Inputs', value: stats.totalInputs, change: '+12%', up: true, color: 'text-primary', bg: 'bg-primary/5' },
    { icon: Users, label: 'Community Cases', value: stats.communityCases, change: `${stats.communityCases > 0 ? '+' : ''}${stats.communityCases}`, up: true, color: 'text-purple-600', bg: 'bg-purple-500/5' },
    { icon: AlertTriangle, label: 'Critical Issues', value: stats.criticalIssues, change: stats.criticalIssues > 0 ? 'Needs attention' : 'None', up: false, color: 'text-danger', bg: 'bg-danger/5' },
    { icon: CheckCircle2, label: 'Resolved Cases', value: stats.resolvedCases, change: `${((stats.resolvedCases / (stats.totalInputs || 1)) * 100).toFixed(0)}%`, up: true, color: 'text-success', bg: 'bg-success/5' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold text-white"
          >
            {greeting}, MP
          </motion.h1>
          <p className="text-slate-400 mt-1">Here's your constituency overview</p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden sm:flex items-center gap-2 text-xs text-slate-500"
        >
          <TrendingUp className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString('en-IN')}
        </motion.div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <span className={`flex items-center gap-1 text-xs ${stat.up ? 'text-success' : 'text-danger'}`}>
                      {typeof stat.change === 'number' ? (
                        <>
                          {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {stat.change}
                        </>
                      ) : (
                        <span className="text-muted-foreground">{stat.change}</span>
                      )}
                    </span>
                  </div>
                  {loading ? (
                    <Skeleton className="h-8 w-20 bg-slate-800" />
                  ) : (
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* AI Brief */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-slate-900 to-purple-600/10 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Today's AI Brief</h3>
                <p className="text-xs text-slate-400">AI-powered analysis of citizen sentiment</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-slate-800" />
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-4 w-1/2 bg-slate-800" />
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed">{aiBrief}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            onClick={() => navigate('/mp/community-cases')}
          >
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-2">View Community Cases</h3>
              <p className="text-sm text-slate-400">See grouped citizen reports by location and category</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            onClick={() => navigate('/mp/ai-assistant')}
          >
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-2">Ask AI Assistant</h3>
              <p className="text-sm text-slate-400">Get insights and recommendations from your AI governance assistant</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
