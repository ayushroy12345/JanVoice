import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getAIResponse } from '@/services/ai'
import { getAllSubmissions } from '@/services/submission'
import { getCommunityCases } from '@/services/community-cases'
import type { AIChatMessage } from '@/types'

const suggestions = [
  'What should I focus on today?',
  'Which village needs urgent attention?',
  'Summarize healthcare problems',
  'What are the top citizen demands?',
  'Which department has most pending issues?',
  'How can I improve citizen satisfaction?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<AIChatMessage[]>([{
    role: 'assistant',
    content: 'Hello! I am your JanVoice AI governance assistant. I have analyzed all citizen submissions and community cases. Ask me anything about your constituency.',
    timestamp: new Date().toISOString(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildContext = async () => {
    const submissions = await getAllSubmissions()
    const cases = getCommunityCases()
    return `Total submissions: ${submissions.length}. Community cases: ${cases.length}. Latest submissions: ${submissions.slice(0, 5).map(s => `[${s.aiCategory}] ${s.aiTitle} (${s.location}) - ${s.priority}`).join('; ')}. Cases: ${cases.slice(0, 3).map(c => `${c.title} in ${c.location} (${c.reportCount} reports, ${c.priority})`).join('; ')}`
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage: AIChatMessage = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const context = await buildContext()
    const response = await getAIResponse(input.trim(), context)

    const aiMessage: AIChatMessage = { role: 'assistant', content: response, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, aiMessage])
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">AI Assistant</h1>
        <p className="text-slate-400 mt-1">Get insights and recommendations from your AI governance assistant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800 h-[600px] flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-slate-800/50 text-slate-300'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs mt-2 opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask your AI assistant..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button onClick={handleSend} disabled={!input.trim() || loading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-white font-semibold text-sm">Suggested Questions</h3>
              </div>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); }}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 text-sm text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
