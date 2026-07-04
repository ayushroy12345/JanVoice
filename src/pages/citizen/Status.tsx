import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, CheckCircle2, AlertTriangle, ArrowLeft, Search, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/store/AuthContext'
import { getCitizenSubmissions } from '@/services/submission'
import type { Submission, SubmissionStatus } from '@/types'

const statusConfig: Record<SubmissionStatus, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: 'Pending Review', icon: Clock, color: 'text-warning', bg: 'bg-warning/5' },
  taken_charge: { label: 'Taken Charge', icon: AlertTriangle, color: 'text-primary', bg: 'bg-primary/5' },
  in_progress: { label: 'In Progress', icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-500/5' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5' },
}

export default function Status() {
  const { citizen } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    if (citizen) {
      getCitizenSubmissions(citizen.id, citizen.phone).then(setSubmissions)
    }
  }, [citizen])

  if (!citizen) {
    navigate('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/submit')}
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-card-foreground" />
          </button>
          <h1 className="text-lg font-bold text-card-foreground">Track Submissions</h1>
          <div className="w-10" />
        </div>

        {submissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground mb-2">No submissions yet</h2>
            <p className="text-muted-foreground mb-6">Share your first concern with your MP</p>
            <Button onClick={() => navigate('/submit')}>Submit Now</Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub, i) => {
              const status = statusConfig[sub.status]
              const StatusIcon = status.icon
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center`}>
                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-card-foreground text-sm capitalize">{sub.type}</p>
                            <p className="text-xs text-muted-foreground">{sub.location || 'Location not set'}</p>
                          </div>
                        </div>
                        <Badge variant={sub.status === 'resolved' ? 'success' : sub.status === 'in_progress' || sub.status === 'taken_charge' ? 'default' : 'warning'}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-card-foreground line-clamp-2 mb-2">{sub.description}</p>
                      {sub.imageUrl && (
                        <div className="mb-2">
                          <img src={sub.imageUrl} alt="Attachment" className="h-32 w-full object-cover rounded-lg border border-border" />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {sub.priority && (
                          <Badge variant={sub.priority === 'Critical' ? 'destructive' : sub.priority === 'High' ? 'warning' : 'secondary'}>
                            {sub.priority}
                          </Badge>
                        )}
                        {sub.aiCategory && (
                          <Badge variant="outline">{sub.aiCategory}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
