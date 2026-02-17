// ═══ PROFILE — Mediterranean + Full API ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/gamification').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF9F6' }}><span className="text-lg text-[#9A9A9A]">Cargando...</span></div>

    const p = data?.profile || { name: 'Crack', avatar: '😎', tier: 'NOVATO', points: 0, totalXP: 0, streak: 0, bestStreak: 0, rank: 0, progress: 0, nextTier: 'FOODIE', nextTierMin: 200 }
    const badges = data?.badges || { unlocked: [], total: 0 }
    const stats = data?.stats || { gamesPlayed: 0, arcadePoints: 0, orderCount: 0, totalSpent: 0 }
    const season = data?.season || { xp: 0, level: 0 }

    return (
        <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
                <div className="max-w-lg mx-auto px-5 py-3 flex items-center gap-3">
                    <Link href="/app" className="text-[#9A9A9A] hover:text-[#5B7A5E]">←</Link>
                    <h1 className="font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>👤 Mi Perfil</h1>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-5 py-6">
                <div className="card-marble text-center mb-6 animate-fade-in">
                    <div className="text-5xl mb-3">{p.avatar}</div>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{p.name}</h2>
                    <span className="tier-badge mt-2 inline-flex">{p.tier}</span>
                    <p className="text-xs text-[#9A9A9A] mt-1">Ranking #{p.rank || '—'}</p>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-[#9A9A9A] mb-1"><span>{p.tier}</span><span>{p.points} / {p.nextTierMin || '∞'} → {p.nextTier || 'MAX'}</span></div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }}></div></div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6 stagger">
                    {[
                        { icon: '🔥', label: 'Racha', value: `${p.streak}d` },
                        { icon: '🎮', label: 'Partidas', value: stats.gamesPlayed },
                        { icon: '🏆', label: 'Arcade', value: stats.arcadePoints },
                        { icon: '📦', label: 'Pedidos', value: stats.orderCount },
                    ].map((s, i) => (
                        <div key={i} className="card text-center !p-2 animate-fade-in">
                            <div className="text-lg">{s.icon}</div>
                            <div className="text-xs text-[#9A9A9A]">{s.label}</div>
                            <div className="font-bold text-sm">{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className="card mb-6">
                    <h3 className="font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>🏅 Logros ({badges.unlocked.length}/{badges.total})</h3>
                    {badges.unlocked.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {badges.unlocked.map((b: any) => (
                                <div key={b.id} className="w-12 h-12 rounded-full bg-[#5B7A5E]/10 border-2 border-[#5B7A5E] flex items-center justify-center text-xl" title={b.name}>{b.icon}</div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-[#9A9A9A]">Completa misiones para desbloquear logros</p>
                    )}
                </div>

                <div className="card mb-6">
                    <h3 className="font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>🏖️ Temporada</h3>
                    <div className="flex justify-between text-xs text-[#9A9A9A] mb-1"><span>Nivel {season.level}</span><span>{season.xp}/{season.nextLevelXP || 100} XP</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${(season.xp / (season.nextLevelXP || 100)) * 100}%`, background: 'linear-gradient(90deg, #C5A55A, #D4BA7A)' }}></div></div>
                </div>

                <div className="card">
                    <h3 className="font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>💰 Resumen</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[#9A9A9A]">Total gastado</span><span className="font-bold text-[#5B7A5E]">{stats.totalSpent.toFixed(2)}€</span></div>
                        <div className="flex justify-between"><span className="text-[#9A9A9A]">XP total</span><span className="font-bold">{p.totalXP}</span></div>
                        <div className="flex justify-between"><span className="text-[#9A9A9A]">Mejor racha</span><span className="font-bold">{p.bestStreak} días</span></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
