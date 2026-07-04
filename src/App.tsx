import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/store/AuthContext'
import MPLayout from '@/components/shared/MPLayout'

import Landing from '@/pages/citizen/Landing'
import Auth from '@/pages/citizen/Auth'
import Submit from '@/pages/citizen/Submit'
import Status from '@/pages/citizen/Status'
import SecureLogin from '@/pages/mp/SecureLogin'
import Dashboard from '@/pages/mp/Dashboard'
import CommunityCases from '@/pages/mp/CommunityCases'
import CaseDetail from '@/pages/mp/CaseDetail'
import AIAssistant from '@/pages/mp/AIAssistant'
import Reports from '@/pages/mp/Reports'
import Settings from '@/pages/mp/Settings'

function MPRoute({ children }: { children: React.ReactNode }) {
  const { isMP } = useAuth()
  if (!isMP) return <Navigate to="/mp-secure-login" replace />
  return <MPLayout>{children}</MPLayout>
}

function AppRoutes() {
  const { citizen } = useAuth()

  return (
    <Routes>
      {/* Citizen Routes */}
      <Route path="/" element={citizen ? <Navigate to="/submit" replace /> : <Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/submit" element={<Submit />} />
      <Route path="/status" element={<Status />} />

      {/* MP Routes */}
      <Route path="/mp-secure-login" element={<SecureLogin />} />
      <Route path="/mp/dashboard" element={<MPRoute><Dashboard /></MPRoute>} />
      <Route path="/mp/community-cases" element={<MPRoute><CommunityCases /></MPRoute>} />
      <Route path="/mp/community-cases/:id" element={<MPRoute><CaseDetail /></MPRoute>} />
      <Route path="/mp/ai-assistant" element={<MPRoute><AIAssistant /></MPRoute>} />
      <Route path="/mp/reports" element={<MPRoute><Reports /></MPRoute>} />
      <Route path="/mp/settings" element={<MPRoute><Settings /></MPRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
