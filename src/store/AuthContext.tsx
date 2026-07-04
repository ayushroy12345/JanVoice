import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Citizen } from '@/types'

interface AuthState {
  citizen: Citizen | null
  isMP: boolean
  loginCitizen: (phone: string) => void
  loginMP: () => void
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [citizen, setCitizen] = useState<Citizen | null>(null)
  const [isMP, setIsMP] = useState(false)

  useEffect(() => {
    const storedCitizen = localStorage.getItem('janvoice_citizen')
    const storedMP = localStorage.getItem('janvoice_mp')
    if (storedCitizen) {
      try { setCitizen(JSON.parse(storedCitizen)) } catch {}
    }
    if (storedMP === 'true') {
      setIsMP(true)
    }
  }, [])

  const loginCitizen = (phone: string) => {
    let citizenData: Citizen
    const existing = localStorage.getItem('janvoice_citizen')
    if (existing) {
      citizenData = JSON.parse(existing)
    } else {
      citizenData = {
        id: `citizen_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        phone,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('janvoice_citizen', JSON.stringify(citizenData))
    }
    setCitizen(citizenData)
    setIsMP(false)
  }

  const loginMP = () => {
    setIsMP(true)
    setCitizen(null)
    localStorage.setItem('janvoice_mp', 'true')
    localStorage.removeItem('janvoice_citizen')
  }

  const logout = () => {
    setCitizen(null)
    setIsMP(false)
    localStorage.removeItem('janvoice_citizen')
    localStorage.removeItem('janvoice_mp')
  }

  return (
    <AuthContext.Provider value={{ citizen, isMP, loginCitizen, loginMP, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
