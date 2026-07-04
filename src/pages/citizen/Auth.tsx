import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Phone, KeyRound, ArrowRight, ArrowLeft, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/store/AuthContext'
import { AUTH_CONFIG } from '@/config/auth.config'

export default function Auth() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { loginCitizen } = useAuth()

  const handlePhoneSubmit = () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    setError('')
    setStep('otp')
  }

  const handleOTPSubmit = () => {
    setLoading(true)
    setError('')

    // Prototype authentication only
    // Replace with SMS OTP verification in production
    setTimeout(() => {
      if (otp === AUTH_CONFIG.MASTER_OTP) {
        loginCitizen(phone)
        navigate('/submit')
      } else {
        setError('Invalid OTP. Try 123456')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-sm mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25 mb-4">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-card-foreground">
              {step === 'phone' ? 'Login with Phone' : 'Enter OTP'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 'phone'
                ? 'Verify your identity to get started'
                : `OTP sent to +91 ${phone}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError('') }}
                    maxLength={10}
                    className="pl-11 text-lg tracking-wider"
                    onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                  />
                </div>
                {error && (
                  <p className="text-sm text-danger">{error}</p>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePhoneSubmit}
                >
                  Send OTP
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError('') }}
                    maxLength={6}
                    className="pl-11 text-lg tracking-[0.5em] text-center"
                    onKeyDown={(e) => e.key === 'Enter' && handleOTPSubmit()}
                  />
                </div>
                {error && (
                  <p className="text-sm text-danger">{error}</p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Demo: Use OTP <span className="font-mono font-bold">123456</span>
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleOTPSubmit}
                  loading={loading}
                >
                  Verify & Login
                </Button>
                <button
                  onClick={() => { setStep('phone'); setError(''); setOtp('') }}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors w-full cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change phone number
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
