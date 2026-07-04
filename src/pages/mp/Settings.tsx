import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Bell, Globe, Moon, Smartphone, LogOut } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/store/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/mp-secure-login')
  }

  const settingSections = [
    {
      title: 'Account',
      items: [
        { icon: Shield, label: 'Admin Email', value: 'mp.demo@gov.in' },
        { icon: Smartphone, label: 'Session', value: 'Active' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: 'Enabled' },
        { icon: Globe, label: 'Language', value: 'English' },
        { icon: Moon, label: 'Dark Mode', value: 'On' },
      ],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {settingSections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}
        >
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-sm text-slate-500">{item.value}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Danger Zone</h3>
            <p className="text-sm text-slate-400 mb-4">End your current session and return to the login screen</p>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
