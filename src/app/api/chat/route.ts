'use client'
import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

type Message = { role: 'user' | 'bot'; content: string }

const MoniIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" rx="3" />
    <path d="M9 12h.01M15 12h.01" />
    <path d="M9 16s1 1 3 1 3-1 3-1" />
    <path d="M12 8V5" />
    <circle cx="12" cy="4" r="1" />
  </svg>
)

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('### ')) return <p key={i} className="font-bold text-indigo-300 mt-2">{line.replace('### ', '')}</p>
    if (line.startsWith('## ')) return <p key={i} className="font-bold text-indigo-300 text-base mt-2">{line.replace('## ', '')}</p>
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-indigo-400 mt-0.5">•</span>
          <span>{parseBold(line.replace(/^[-•] /, ''))}</span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-1" />
    return <p key={i}>{parseBold(line)}</p>
  })
}

function parseBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      : part
  )
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Olá! Sou o **Moni**, seu assistente financeiro pessoal. Como posso te ajudar hoje?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: 'Erro ao conectar. Tente novamente.' }])
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen text-slate-100 flex flex-col items-center justify-between p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #0f1117 50%, #0a0d1f 100%)' }}>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <header className="w-full max-w-2xl flex items-center justify-between py-4 border-b border-white/10 relative z-10
        backdrop-blur-md bg-white/5 rounded-2xl px-5 mb-2 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/80 backdrop-blur flex items-center justify-center shadow-lg shadow-indigo-900/50 border border-indigo-500/30">
            <MoniIcon size={16} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 tracking-tight">Moni</h1>
            <p className="text-xs text-slate-400">Seu dinheiro, mais inteligente.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          online
        </div>
      </header>

      <div className="flex-1 w-full max-w-2xl overflow-y-auto py-6 space-y-4 scrollbar-hide relative z-10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border text-xs font-semibold ${
              msg.role === 'bot'
                ? 'bg-indigo-600/70 backdrop-blur text-white shadow-lg shadow-indigo-900/50 border-indigo-500/30'
                : 'bg-slate-700/60 backdrop-blur text-slate-300 border-slate-600/30'
            }`}>
              {msg.role === 'bot' ? <MoniIcon size={14} /> : 'eu'}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed space-y-0.5 ${
              msg.role === 'user'
                ? 'bg-indigo-600/70 backdrop-blur-md text-white rounded-br-sm shadow-lg shadow-indigo-900/30 border border-indigo-500/20'
                : 'bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 rounded-bl-sm shadow-lg shadow-black/20'
            }`}>
              {msg.role === 'bot' ? renderMarkdown(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-600/70 backdrop-blur flex items-center justify-center shadow-lg border border-indigo-500/30">
              <MoniIcon size={14} />
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm shadow-lg">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="w-full max-w-2xl flex flex-wrap gap-2 mb-4 relative z-10">
          {['Como montar reserva de emergência?', 'CDI vs Poupança', 'Como sair das dívidas?'].map(s => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 bg-white/5 backdrop-blur hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10">
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-all duration-300 shadow-xl shadow-black/30">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Pergunte ao Moni..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-600/80 backdrop-blur hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-900/50 border border-indigo-500/30 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-3">
          Moni pode cometer erros. Verifique informações importantes.
        </p>
      </div>

    </main>
  )
}
