import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { QrCode, ArrowRight, Shield, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-12 pb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25 mb-6">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            JanVoice AI
          </h1>
          <p className="text-muted-foreground text-lg">
            One QR. Every Voice. Smarter Decisions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-8 mb-8 text-center"
        >
          <p className="text-2xl font-semibold text-card-foreground mb-2">
            Your Voice Matters
          </p>
          <p className="text-muted-foreground">
            Share your concerns, ideas, and requests with your local representative.
            Powered by AI to make every voice count.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          {[
            { icon: Shield, text: 'Report problems in your area', color: 'text-primary' },
            { icon: Users, text: 'Suggest improvements for your community', color: 'text-purple-600' },
            { icon: Zap, text: 'Get faster response from authorities', color: 'text-amber-600' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/60 rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="text-sm text-card-foreground">{item.text}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            size="lg"
            className="w-full text-base"
            onClick={() => navigate('/auth')}
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Secured with AI-powered governance technology
        </motion.p>
      </div>
    </div>
  )
}
