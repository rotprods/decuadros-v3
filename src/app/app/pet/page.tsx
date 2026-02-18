// ═══ PET — Mediterranean Stitch Redesign ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const stages = [
    { name: 'Huevo', emoji: '🥚', minXp: 0, icon: 'egg' },
    { name: 'Bebé Pulpi', emoji: '🐙', minXp: 100, icon: 'child_care' },
    { name: 'Pulpi Chef', emoji: '👨‍🍳', minXp: 500, icon: 'restaurant' },
    { name: 'Pulpi Dorado', emoji: '🌟', minXp: 1500, icon: 'star' },
]

export default function PetPage() {
    const [pet, setPet] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [animating, setAnimating] = useState(false)
    const [lastAction, setLastAction] = useState('')

    const fetchPet = () => {
        fetch('/api/gamification').then(r => r.json()).then(d => {
            setPet(d?.pet || { name: 'Pulpito', stage: 0, stageName: 'Huevo', emoji: '🥚', mood: 80, actions: 0 })
            setLoading(false)
        }).catch(() => {
            setPet({ name: 'Pulpito', stage: 0, stageName: 'Huevo', emoji: '🥚', mood: 80, actions: 0 })
            setLoading(false)
        })
    }

    useEffect(() => { fetchPet() }, [])

    const doAction = async (action: 'feed' | 'play' | 'care') => {
        if (animating) return
        setAnimating(true)
        const labels: Record<string, string> = { feed: '🍽️ ¡Ñam ñam!', play: '🎮 ¡A jugar!', care: '🛁 ¡Cuidado!' }
        setLastAction(labels[action])
        try {
            await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: action === 'feed' ? 'pet_feed' : 'pet_play' }) })
            fetchPet()
        } catch { }
        setTimeout(() => { setAnimating(false); setLastAction('') }, 1500)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDFBF7' }}>
            <span className="text-4xl animate-pulse">🐙</span>
        </div>
    )

    const stage = pet ? (stages.find(s => s.name === pet.stageName) || stages[pet.stage] || stages[0]) : stages[0]
    const nextStage = stages[stages.indexOf(stage) + 1]
    const health = 85
    const hunger = pet?.mood || 60
    const happiness = Math.min(100, (pet?.mood || 80) + 10)

    return (
        <div className="min-h-screen azulejo-pattern pb-28" style={{ background: '#FDFBF7' }}>
            {/* Header */}
            <header className="p-6">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <Link href="/app" className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#C3703C]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#171412]">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-extrabold tracking-tight">Tu Mascota</h1>
                        <span className="text-xl">❤️</span>
                    </div>
                    <div className="w-10" />
                </div>
            </header>

            <div className="max-w-lg mx-auto px-6">
                {/* Pet Name */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <h2 className="text-2xl font-extrabold">{pet?.name || 'Pulpito'}</h2>
                    <span className="material-symbols-outlined text-[18px] text-[#827268] cursor-pointer">edit</span>
                </div>

                {/* Pet Display */}
                <div className="relative flex flex-col items-center mb-8">
                    {/* Mood Badge */}
                    <div className="absolute top-0 right-4 z-10 flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-bold">
                        😊 Feliz
                    </div>

                    {/* Level Badge */}
                    <div className="absolute top-0 left-4 z-10 flex items-center gap-1 bg-[#D4AF37]/15 text-[#D4AF37] rounded-full px-3 py-1 text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        Nivel {pet?.stage ? pet.stage + 1 : 1}
                    </div>

                    {/* Pet Character */}
                    <div className="w-48 h-48 rounded-full bg-gradient-to-b from-[#E8D5C0]/30 to-[#FDFBF7] flex items-center justify-center mb-4">
                        <div className={`text-8xl transition-transform duration-300 ${animating ? 'scale-125 animate-shake' : 'animate-float'}`}>
                            {pet?.emoji || stage.emoji}
                        </div>
                    </div>
                    {lastAction && <p className="text-sm text-[#C3703C] font-bold animate-fade-scale">{lastAction}</p>}
                </div>

                {/* Stats Bars */}
                <div className="flex flex-col gap-4 mb-8">
                    {[
                        { label: '❤️ Salud', value: health, color: '#4CAF50', bg: 'rgba(76,175,80,0.1)' },
                        { label: '🍕 Hambre', value: hunger, color: '#FF9800', bg: 'rgba(255,152,0,0.1)' },
                        { label: '😊 Felicidad', value: happiness, color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span>{stat.label}</span>
                                <span style={{ color: stat.color }}>{stat.value}%</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: stat.bg }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stat.value}%`, background: stat.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { action: 'feed' as const, icon: 'restaurant', label: 'Alimentar', color: '#6B705C', cost: 10 },
                        { action: 'play' as const, icon: 'sports_esports', label: 'Jugar', color: '#C3703C', cost: 15 },
                        { action: 'care' as const, icon: 'spa', label: 'Cuidar', color: '#1D2D44', cost: 5 },
                    ].map((btn) => (
                        <button key={btn.action} onClick={() => doAction(btn.action)} disabled={animating}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:shadow-md disabled:opacity-50"
                            style={{ background: `${btn.color}15`, border: `1px solid ${btn.color}20` }}>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: btn.color }}>
                                <span className="material-symbols-outlined">{btn.icon}</span>
                            </div>
                            <span className="text-xs font-bold" style={{ color: btn.color }}>{btn.label}</span>
                            <span className="text-[10px] text-[#827268]">{btn.cost} 🪙</span>
                        </button>
                    ))}
                </div>

                {/* Evolution Stages */}
                {nextStage && (
                    <div className="card mb-6">
                        <h3 className="font-bold text-sm mb-2">Progreso de Evolución</h3>
                        <div className="flex justify-between text-xs text-[#827268] mb-1">
                            <span>{stage.name}</span>
                            <span>{pet?.actions || 0}/{pet?.nextEvolution || nextStage.minXp}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#D4AF37]/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C460]" style={{ width: `${((pet?.actions || 0) / (pet?.nextEvolution || nextStage.minXp)) * 100}%` }}></div>
                        </div>
                    </div>
                )}

                {/* Achievements */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold mb-3">Logros de {pet?.name || 'Pulpito'}</h3>
                    <div className="flex gap-3 justify-between">
                        {[
                            { name: 'Primer Plato', icon: 'restaurant', unlocked: true },
                            { name: 'Racha 7', icon: 'local_fire_department', unlocked: true },
                            { name: 'Chef Junior', icon: 'emoji_events', unlocked: true },
                            { name: 'Explorador', icon: 'explore', unlocked: false },
                        ].map((ach, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${ach.unlocked
                                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]'
                                    : 'bg-[#e4e0dd]/50 border-[#d4d0cc] text-[#a09187]'
                                    }`}>
                                    <span className="material-symbols-outlined" style={ach.unlocked ? { fontVariationSettings: "'FILL' 1" } : {}}>{ach.icon}</span>
                                </div>
                                <span className={`text-[10px] font-medium ${ach.unlocked ? 'text-[#171412]' : 'text-[#a09187]'}`}>{ach.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[#C3703C]/10 bg-white/90 px-6 pb-8 pt-3 backdrop-blur-md">
                <Link href="/app" className="flex flex-col items-center gap-1 text-[#827268]">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight">Inicio</span>
                </Link>
                <Link href="/menu" className="flex flex-col items-center gap-1 text-[#827268]">
                    <span className="material-symbols-outlined">restaurant_menu</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight">Carta</span>
                </Link>
                <Link href="/app/arcade" className="flex flex-col items-center gap-1 text-[#827268]">
                    <span className="material-symbols-outlined">sports_esports</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight">Arcade</span>
                </Link>
                <Link href="/app/profile" className="flex flex-col items-center gap-1 text-[#827268]">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight">Perfil</span>
                </Link>
            </nav>
        </div>
    )
}
