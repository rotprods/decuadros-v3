// ═══ PET — Mediterranean + Full API ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const stages = [
    { name: 'Huevo', emoji: '🥚', minXp: 0 },
    { name: 'Bebé Pulpi', emoji: '🐙', minXp: 100 },
    { name: 'Pulpi Chef', emoji: '👨‍🍳', minXp: 500 },
    { name: 'Pulpi Dorado', emoji: '🌟', minXp: 1500 },
]

export default function PetPage() {
    const [pet, setPet] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [animating, setAnimating] = useState(false)
    const [lastAction, setLastAction] = useState('')

    const fetchPet = () => {
        fetch('/api/gamification').then(r => r.json()).then(d => {
            setPet(d?.pet || { name: 'Pulpi', stage: 0, stageName: 'Huevo', emoji: '🥚', mood: 80, actions: 0 })
            setLoading(false)
        }).catch(() => {
            setPet({ name: 'Pulpi', stage: 0, stageName: 'Huevo', emoji: '🥚', mood: 80, actions: 0 })
            setLoading(false)
        })
    }

    useEffect(() => { fetchPet() }, [])

    const doAction = async (action: 'feed' | 'play') => {
        if (animating) return
        setAnimating(true)
        setLastAction(action === 'feed' ? '🍽️ ¡Ñam ñam!' : '🎾 ¡A jugar!')
        try {
            await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: action === 'feed' ? 'pet_feed' : 'pet_play' }) })
            fetchPet()
        } catch { }
        setTimeout(() => { setAnimating(false); setLastAction('') }, 1500)
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF9F6' }}><span className="text-2xl animate-pulse">🐙</span></div>

    const stage = pet ? (stages.find(s => s.name === pet.stageName) || stages[pet.stage] || stages[0]) : stages[0]
    const nextStage = stages[stages.indexOf(stage) + 1]

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <Link href="/app" className="self-start text-sm text-[#9A9A9A] hover:text-[#5B7A5E] mb-4">← App</Link>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>🐙 Tu Mascota</h1>

            <div className="card-marble max-w-sm w-full text-center mb-6 animate-fade-in">
                <div className={`text-7xl mb-4 transition-transform duration-300 ${animating ? 'scale-125' : ''}`}>
                    {pet?.emoji || stage.emoji}
                </div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{pet?.name || 'Pulpi'}</h2>
                <p className="text-sm text-[#9A9A9A]">{pet?.stageName || stage.name}</p>
                {lastAction && <p className="text-sm text-[#5B7A5E] font-bold animate-fade-scale mt-2">{lastAction}</p>}

                <div className="mt-4 text-left">
                    <div className="flex justify-between text-xs text-[#9A9A9A] mb-1"><span>Humor</span><span>{pet?.mood || 80}%</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${pet?.mood || 80}%` }}></div></div>
                </div>

                {nextStage && (
                    <div className="mt-3 text-left">
                        <div className="flex justify-between text-xs text-[#9A9A9A] mb-1"><span>Evolución</span><span>{pet?.actions || 0}/{pet?.nextEvolution || nextStage.minXp}</span></div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${((pet?.actions || 0) / (pet?.nextEvolution || nextStage.minXp)) * 100}%`, background: 'linear-gradient(90deg, #C5A55A, #D4BA7A)' }}></div></div>
                    </div>
                )}
            </div>

            <div className="flex gap-3 mb-6">
                <button onClick={() => doAction('feed')} disabled={animating} className="btn-olive disabled:opacity-50">🍽️ Alimentar</button>
                <button onClick={() => doAction('play')} disabled={animating} className="px-6 py-3 rounded-lg font-semibold text-sm bg-[#C5A55A] text-white hover:bg-[#B89548] transition-all disabled:opacity-50">🎾 Jugar</button>
            </div>

            <div className="card max-w-sm w-full">
                <h3 className="font-bold text-sm mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Fases de Evolución</h3>
                <div className="flex justify-between">
                    {stages.map((s, i) => (
                        <div key={i} className={`text-center transition-opacity ${(pet?.stage ?? 0) >= i ? 'opacity-100' : 'opacity-30'}`}>
                            <div className="text-2xl mb-1">{s.emoji}</div>
                            <div className="text-[10px] text-[#9A9A9A]">{s.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
