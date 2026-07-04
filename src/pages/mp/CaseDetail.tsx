import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, MapPin, Clock, Calendar,
  AlertTriangle, Building, Target, ChevronLeft,
  Phone, CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCaseById } from '@/services/community-cases'
import { getSubmissionById, updateSubmissionStatus } from '@/services/submission'
import type { CommunityCase, SubmissionStatus, Submission } from '@/types'

const priorityVariants: Record<string, string> = {
  Critical: 'destructive', High: 'warning', Medium: 'default', Low: 'secondary',
}

const statusVariants: Record<SubmissionStatus, string> = {
  pending: 'warning',
  taken_charge: 'default',
  in_progress: 'default',
  resolved: 'success',
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState<CommunityCase | null>(null)
  const [reports, setReports] = useState<Submission[]>([])

  useEffect(() => {
    if (id) {
      const data = getCaseById(id)
      setCaseData(data || null)
      if (data) {
        Promise.all(data.submissionIds.map(sid => getSubmissionById(sid)))
          .then(results => setReports(results.filter(Boolean) as Submission[]))
      }
    }
  }, [id])

  const handleStatusChange = (submissionId: string, newStatus: SubmissionStatus) => {
    updateSubmissionStatus(submissionId, newStatus)
    setReports(prev => prev.map(r => r.id === submissionId ? { ...r, status: newStatus } : r))
  }

  if (!caseData) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Case not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/mp/community-cases')}>
          Back to Cases
        </Button>
      </div>
    )
  }

  const nextStatus: Record<SubmissionStatus, SubmissionStatus> = {
    pending: 'taken_charge',
    taken_charge: 'in_progress',
    in_progress: 'resolved',
    resolved: 'resolved',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/mp/community-cases')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Community Cases
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6 lg:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{caseData.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{caseData.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />{caseData.reportCount} reports</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(caseData.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <Badge variant={(priorityVariants as any)[caseData.priority] || 'default'} className="text-sm px-4 py-1">
                {caseData.priority}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Building className="w-4 h-4" />Category</div>
                <p className="text-white font-semibold">{caseData.category}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><AlertTriangle className="w-4 h-4" />Total Reports</div>
                <p className="text-white font-semibold">{caseData.reportCount}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Target className="w-4 h-4" />Recommended Action</div>
                <p className="text-white font-semibold text-sm">{caseData.recommendedAction}</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">AI Summary</h3>
              <p className="text-slate-300">{caseData.summary}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Reports */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Individual Reports ({reports.length})</h2>
        <div className="space-y-3">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Photo */}
                    {report.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={report.imageUrl}
                          alt="Report photo"
                          className="w-full lg:w-40 h-32 object-cover rounded-xl border border-slate-700"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                        <div>
                          <p className="text-white font-medium capitalize">{report.type}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {report.citizenPhone}
                            </span>
                          </div>
                        </div>
                        <Badge variant={(statusVariants as any)[report.status] || 'warning'}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-300 mb-3">{report.description}</p>

                      {/* Tags */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge variant="outline" className="text-slate-400 border-slate-700">{report.department}</Badge>
                        <Badge variant={(priorityVariants as any)[report.priority] || 'default'}>{report.priority}</Badge>
                        {report.location && report.location !== 'Not specified' && (
                          <Badge variant="outline" className="text-slate-400 border-slate-700">
                            <MapPin className="w-3 h-3 mr-1" />{report.location}
                          </Badge>
                        )}
                      </div>

                      {/* Status Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        {report.status !== 'resolved' ? (
                          <>
                            {report.status === 'pending' && (
                              <Button size="sm" variant="default" onClick={() => handleStatusChange(report.id, 'taken_charge')}>
                                Take Charge
                              </Button>
                            )}
                            {report.status === 'taken_charge' && (
                              <Button size="sm" variant="default" onClick={() => handleStatusChange(report.id, 'in_progress')}>
                                Mark In Progress
                              </Button>
                            )}
                            {report.status === 'in_progress' && (
                              <Button size="sm" variant="default" onClick={() => handleStatusChange(report.id, 'resolved')}>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                            <span className="text-xs text-slate-500 ml-2">
                              Next: {nextStatus[report.status].replace('_', ' ')}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-success flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
