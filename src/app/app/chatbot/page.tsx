// ═══ CHATBOT — Mediterranean ═══
'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatbotPage() {
    const [msgs, setMsgs] = useState<Msg[]>([
        { role: 'assistant', content: '¡Bienvenido! Soy el Chef AI de De Cuadros 🫒 ¿En qué puedo ayudarte? Puedo recomendarte platos, resolver dudas sobre ingredientes o contarte sobre nuestra carta.' },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottom = useRef<HTMLDivElement>(null)
    useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

    const send = async () => {
        if (!input.trim() || loading) return
        const text = input.trim(); setInput('')
        setMsgs(p => [...p, { role: 'user', content: text }]); setLoading(true)
        try {
            const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
            const data = await res.json()
            setMsgs(p => [...p, { role: 'assistant', content: data.reply || data.message || 'Disculpa, ha ocurrido un error.' }])
        } catch { setMsgs(p => [...p, { role: 'assistant', content: 'Error de conexión. Inténtalo de nuevo.' }]) }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#FAF9F6' }}>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
                <div className="max-w-lg mx-auto px-5 py-3 flex items-center gap-3">
                    <Link href="/app" className="text-[#9A9A9A] hover:text-[#5B7A5E]">←</Link>
                    <div className="w-10 h-10 rounded-full bg-[#5B7A5E]/10 flex items-center justify-center text-xl">🤖</div>
                    <div>
                        <div className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>Chef AI</div>
                        <div className="text-xs text-[#5B7A5E]">● Online</div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 max-w-lg mx-auto w-full">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex mb-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        {m.role === 'assistant' && <div className="text-xl mr-2 mt-1 shrink-0">🤖</div>}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-[#5B7A5E] text-white rounded-br-sm' : 'bg-white border border-[#EDE9E0] text-[#2C2C2C] rounded-bl-sm shadow-sm'
                            }`}>{m.content}</div>
                    </div>
                ))}
                {loading && (
                    <div className="flex mb-4 animate-fade-in">
                        <div className="text-xl mr-2">🤖</div>
                        <div className="bg-white border border-[#EDE9E0] rounded-2xl px-4 py-3 rounded-bl-sm shadow-sm">
                            <div className="flex gap-1">
                                {[0, 0.15, 0.3].map((d, i) => <span key={i} className="w-2 h-2 bg-[#9A9A9A] rounded-full animate-bounce" style={{ animationDelay: `${d}s` }}></span>)}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottom}></div>
            </div>

            {msgs.length <= 2 && (
                <div className="px-5 pb-2 max-w-lg mx-auto w-full">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {['¿Qué me recomiendas?', '¿Opciones veganas?', '¿Plato más popular?', '¿Qué postres hay?'].map((s, i) => (
                            <button key={i} onClick={() => setInput(s)} className="shrink-0 text-xs bg-white border border-[#EDE9E0] rounded-full px-3 py-1.5 text-[#6B6B6B] hover:border-[#5B7A5E]/30">{s}</button>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-[#EDE9E0] bg-white/80 backdrop-blur-md p-4">
                <div className="max-w-lg mx-auto flex gap-2">
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Pregúntame lo que quieras..." className="input-premium flex-1 !rounded-full !py-3" />
                    <button onClick={send} disabled={loading || !input.trim()} className="w-11 h-11 rounded-full bg-[#5B7A5E] flex items-center justify-center text-white font-bold disabled:opacity-30 hover:bg-[#4A6B4D] transition-colors">↑</button>
                </div>
            </div>
        </div>
    )
}
