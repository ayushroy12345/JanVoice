import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, BarChart3, PieChart, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getAllSubmissions } from '@/services/submission'
import { getCommunityCases } from '@/services/community-cases'
import type { Submission } from '@/types'

export default function Reports() {
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    getAllSubmissions().then(setSubmissions)
  }, [])

  const totalSubmissions = submissions.length
  const resolvedSubmissions = submissions.filter(s => s.status === 'resolved').length
  const resolutionRate = totalSubmissions > 0 ? ((resolvedSubmissions / totalSubmissions) * 100).toFixed(1) : '0'

  const categoryBreakdown: Record<string, number> = {}
  submissions.forEach(s => {
    categoryBreakdown[s.aiCategory] = (categoryBreakdown[s.aiCategory] || 0) + 1
  })

  const priorityBreakdown: Record<string, number> = {}
  submissions.forEach(s => {
    priorityBreakdown[s.priority] = (priorityBreakdown[s.priority] || 0) + 1
  })

  const departmentBreakdown: Record<string, number> = {}
  submissions.forEach(s => {
    departmentBreakdown[s.department] = (departmentBreakdown[s.department] || 0) + 1
  })

  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]
  const topDepartment = Object.entries(departmentBreakdown).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Detailed analytics on citizen submissions</p>
        </div>
        <Button variant="outline" size="sm" className="text-slate-300 border-slate-700">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Submissions', value: totalSubmissions, color: 'text-primary', bg: 'bg-primary/5' },
          { icon: BarChart3, label: 'Top Category', value: topCategory?.[0] || 'N/A', color: 'text-purple-600', bg: 'bg-purple-500/5' },
          { icon: TrendingUp, label: 'Resolution Rate', value: `${resolutionRate}%`, color: 'text-success', bg: 'bg-success/5' },
          { icon: PieChart, label: 'Busiest Dept', value: topDepartment?.[0]?.split(' ').slice(0, 2).join(' ') || 'N/A', color: 'text-warning', bg: 'bg-warning/5' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4 lg:p-6">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">By Category</h3>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count], i) => {
                    const pct = ((count / totalSubmissions) * 100).toFixed(0)
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{cat}</span>
                          <span className="text-slate-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">By Priority</h3>
              <div className="space-y-3">
                {Object.entries(priorityBreakdown)
                  .sort((a, b) => {
                    const order = ['Critical', 'High', 'Medium', 'Low']
                    return order.indexOf(a[0]) - order.indexOf(b[0])
                  })
                  .map(([priority, count], i) => {
                    const pct = ((count / totalSubmissions) * 100).toFixed(0)
                    const barColor = priority === 'Critical' ? 'bg-danger' : priority === 'High' ? 'bg-warning' : priority === 'Medium' ? 'bg-primary' : 'bg-slate-500'
                    return (
                      <div key={priority}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{priority}</span>
                          <span className="text-slate-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`h-full ${barColor} rounded-full`}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* All submissions table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Recent Submissions</h3>
            {submissions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No submissions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-left py-3 px-2">Priority</th>
                      <th className="text-left py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.slice(0, 10).map((s) => (
                      <tr key={s.id} className="border-b border-slate-800/50 text-slate-300 hover:bg-slate-800/30">
                        <td className="py-3 px-2">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-2 capitalize">{s.type}</td>
                        <td className="py-3 px-2">{s.aiCategory}</td>
                        <td className="py-3 px-2">
                          <Badge variant={s.priority === 'Critical' ? 'destructive' : s.priority === 'High' ? 'warning' : s.priority === 'Medium' ? 'default' : 'secondary'}>
                            {s.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={s.status === 'resolved' ? 'success' : s.status === 'in_progress' || s.status === 'taken_charge' ? 'default' : 'warning'}>
                            {s.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
