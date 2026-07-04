import { type ReactNode } from 'react'
import MPSidebar from './MPSidebar'

export default function MPLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950">
      <MPSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
