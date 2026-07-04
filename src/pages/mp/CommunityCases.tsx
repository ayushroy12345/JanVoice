import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, MapPin, ExternalLink, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCommunityCases, rebuildCommunityCases } from '@/services/community-cases'
import type { CommunityCase } from '@/types'

const priorityColors = {
  Critical: 'destructive',
  High: 'warning',
  Medium: 'default',
  Low: 'secondary',
}

export default function CommunityCases() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<CommunityCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    await rebuildCommunityCases()
    const data = getCommunityCases()
    setCases(data)
    setLoading(false)
  }

  const getPriorityColor = (priority: string) => {
    return (priorityColors as Record<string, string>)[priority] || 'default'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Community Cases</h1>
          <p className="text-slate-400 mt-1">Grouped citizen reports by issue and location</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadCases} className="text-slate-300 border-slate-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 bg-slate-800 mb-4" />
                <Skeleton className="h-4 w-32 bg-slate-800 mb-2" />
                <Skeleton className="h-4 w-64 bg-slate-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No community cases yet</h2>
          <p className="text-slate-400">Cases will appear here when citizens submit reports from the same area</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                onClick={() => navigate(`/mp/community-cases/${c.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${
                        c.priority === 'Critical' ? 'bg-danger/10' :
                        c.priority === 'High' ? 'bg-warning/10' :
                        'bg-primary/5'
                      } flex items-center justify-center`}>
                        <Users className={`w-5 h-5 ${
                          c.priority === 'Critical' ? 'text-danger' :
                          c.priority === 'High' ? 'text-warning' :
                          'text-primary'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{c.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          {c.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{c.reportCount}</p>
                        <p className="text-xs text-slate-400">reports</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={getPriorityColor(c.priority) as any}>{c.priority}</Badge>
                    <Badge variant="outline" className="text-slate-400 border-slate-700">{c.category}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{c.summary}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
