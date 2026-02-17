// ═══ DASHBOARD — Mediterranean + Full API ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AppPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/gamification')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const p = data?.profile || { name: 'Crack', avatar: '😎', tier: 'NOVATO', points: 0, totalXP: 0, progress: 0, nextTier: 'FOODIE', nextTierMin: 200, streak: 0 }
    const missions = data?.missions || []
    const pet = data?.pet
    const stats = data?.stats || { gamesPlayed: 0, arcadePoints: 0 }

    const claimMission = async (id: string) => {
        await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'claim_mission', data: { missionId: id } }) })
        const r = await fetch('/api/gamification')
        setData(await r.json())
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            {/* Header */}
            <header className="px-5 pt-6 pb-4">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">{p.avatar}</div>
                        <div>
                            <h1 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>¡Hola, {p.name}!</h1>
                            <div className="flex items-center gap-2">
                                <span className="tier-badge">{p.tier}</span>
                                <span className="text-xs text-[#9A9A9A]">{p.points} pts</span>
                            </div>
                        </div>
                    </div>
                    <Link href="/app/profile" className="w-9 h-9 rounded-full bg-[#F3F0EA] flex items-center justify-center text-[#9A9A9A] hover:bg-[#EDE9E0] transition-colors">⚙️</Link>
                </div>

                {/* XP Bar */}
                <div className="max-w-lg mx-auto mt-4">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }}></div></div>
                    <div className="flex justify-between text-[10px] text-[#9A9A9A] mt-1">
                        <span>{p.tier}</span>
                        <span>{p.points} / {p.nextTierMin || '∞'} → {p.nextTier || 'MAX'}</span>
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-5">
                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-3 mb-6 stagger">
                    {[
                        { icon: '🍽️', label: 'Carta', href: '/menu' },
                        { icon: '🎡', label: 'Ruleta', href: '/app/wheel' },
                        { icon: '🐙', label: 'Mascota', href: '/app/pet' },
                        { icon: '🤖', label: 'Chef AI', href: '/app/chatbot' },
                        { icon: '🎮', label: 'Arcade', href: '/app/arcade' },
                        { icon: '🏆', label: 'Ranking', href: '/app/leaderboard' },
                        { icon: '📸', label: 'Social', href: '/app/social' },
                        { icon: '👤', label: 'Perfil', href: '/app/profile' },
                    ].map((a, i) => (
                        <Link key={i} href={a.href} className="card text-center !p-3 hover:!border-[#5B7A5E]/20 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                            <div className="text-2xl mb-1">{a.icon}</div>
                            <div className="text-[10px] text-[#6B6B6B] font-medium">{a.label}</div>
                        </Link>
                    ))}
                </div>

                {/* Daily Streak */}
                <div className="card-marble mb-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>🔥 Racha Diaria</h2>
                        <span className="text-lg font-bold text-[#5B7A5E]">{p.streak} días</span>
                    </div>
                    <div className="flex justify-between">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                            <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium ${i < (p.streak % 7) ? 'bg-[#5B7A5E] text-white' : 'bg-[#F3F0EA] text-[#9A9A9A]'}`}>{d}</div>
                        ))}
                    </div>
                </div>

                {/* Missions */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>🎯 Misiones del Día</h2>
                        <span className="text-xs text-[#9A9A9A]">{missions.filter((m: any) => !m.completed).length} pendientes</span>
                    </div>
                    <div className="space-y-2 stagger">
                        {(missions.length > 0 ? missions : [
                            { id: '1', icon: '📱', text: 'Abre la app', reward: 5, completed: false },
                            { id: '2', icon: '🐙', text: 'Alimenta a tu mascota', reward: 15, completed: false },
                            { id: '3', icon: '📸', text: 'Comparte 1 foto', reward: 20, completed: false },
                            { id: '4', icon: '🎮', text: 'Juega 1 partida', reward: 10, completed: false },
                        ]).map((m: any, i: number) => (
                            <div key={m.id || i} className={`card !p-3 flex items-center gap-3 animate-fade-in ${m.completed ? 'opacity-50' : ''}`}>
                                <div className="text-xl">{m.icon}</div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{m.text}</div>
                                    <div className="text-xs text-[#5B7A5E]">+{m.reward} XP</div>
                                </div>
                                {m.completed ? (
                                    <span className="text-[#5B7A5E] text-lg">✓</span>
                                ) : (
                                    <button onClick={() => claimMission(m.id)} className="text-xs text-[#9A9A9A] bg-[#F3F0EA] rounded-full px-2 py-1">0/1</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pet Preview */}
                {pet && (
                    <Link href="/app/pet" className="card-marble mb-6 flex items-center gap-4 hover:!border-[#5B7A5E]/20 transition-all">
                        <span className="text-4xl">{pet.emoji || '🥚'}</span>
                        <div>
                            <div className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>{pet.name || 'Pulpi'}</div>
                            <div className="text-xs text-[#9A9A9A]">{pet.stageName} · Humor {pet.mood}%</div>
                        </div>
                    </Link>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6 stagger">
                    <div className="card text-center animate-fade-in">
                        <div className="text-2xl mb-1">🎮</div>
                        <div className="text-lg font-bold text-[#5B7A5E]">{stats.gamesPlayed}</div>
                        <div className="text-[10px] text-[#9A9A9A]">Partidas</div>
                    </div>
                    <div className="card text-center animate-fade-in">
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="text-lg font-bold text-[#C5A55A]">{stats.arcadePoints}</div>
                        <div className="text-[10px] text-[#9A9A9A]">Arcade pts</div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#EDE9E0] z-50">
                <div className="max-w-lg mx-auto flex justify-around py-2">
                    {[
                        { icon: '🏠', label: 'Inicio', href: '/app', active: true },
                        { icon: '🍽️', label: 'Carta', href: '/menu' },
                        { icon: '🎮', label: 'Arcade', href: '/app/arcade' },
                        { icon: '👤', label: 'Perfil', href: '/app/profile' },
                    ].map((n, i) => (
                        <Link key={i} href={n.href} className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-3 ${n.active ? 'text-[#5B7A5E] font-bold' : 'text-[#9A9A9A]'}`}>
                            <span className="text-lg">{n.icon}</span>{n.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}
