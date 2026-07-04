import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/store/AuthContext'
import { AUTH_CONFIG } from '@/config/auth.config'

export default function SecureLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { loginMP } = useAuth()

  const handleLogin = () => {
    setLoading(true)
    setError('')

    // Prototype authentication only
    // Replace with real authentication service in production
    setTimeout(() => {
      if (email === AUTH_CONFIG.ADMIN_EMAIL && password === AUTH_CONFIG.ADMIN_PASSWORD) {
        loginMP()
        navigate('/mp/dashboard')
      } else {
        setError('Invalid credentials. Use demo account.')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-dark rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25 mb-4">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">MP Secure Access</h1>
            <p className="text-slate-400 text-sm mt-1">Authorized personnel only</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className="bg-white/5 border-slate-700 text-white placeholder:text-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="bg-white/5 border-slate-700 text-white placeholder:text-slate-500 pr-11"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-danger bg-danger/10 rounded-lg p-3 text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleLogin}
              loading={loading}
            >
              <LogIn className="mr-2 w-4 h-4" />
              Access Dashboard
            </Button>

            <div className="border-t border-slate-700 pt-4 mt-4">
              <p className="text-xs text-slate-500 text-center">
                Demo credentials:<br />
                <span className="font-mono text-slate-400">{AUTH_CONFIG.ADMIN_EMAIL}</span><br />
                <span className="font-mono text-slate-400">{AUTH_CONFIG.ADMIN_PASSWORD}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
