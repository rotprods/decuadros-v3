// ═══ DASHBOARD — Mediterranean Stitch Redesign ═══
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

    const p = data?.profile || { name: 'Roberto', avatar: '😎', tier: 'NOVATO', points: 0, totalXP: 0, progress: 0, nextTier: 'FOODIE', nextTierMin: 200, streak: 0 }
    const missions = data?.missions || []
    const pet = data?.pet
    const stats = data?.stats || { gamesPlayed: 0, arcadePoints: 0 }

    const claimMission = async (id: string) => {
        await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'claim_mission', data: { missionId: id } }) })
        const r = await fetch('/api/gamification')
        setData(await r.json())
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDFBF7' }}>
            <span className="material-symbols-outlined text-4xl text-[#C3703C] animate-pulse">restaurant</span>
        </div>
    )

    return (
        <div className="min-h-screen pb-28 azulejo-pattern" style={{ background: '#FDFBF7' }}>
            {/* ── Header ── */}
            <header className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between max-w-lg mx-auto w-full">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full border-2 border-[#C3703C]/20 p-0.5 bg-white">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C3703C] to-[#D4AF37] flex items-center justify-center text-2xl text-white font-bold">
                                    {p.name?.charAt(0) || 'R'}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-[14px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight">¡Hola, {p.name}!</h1>
                            <p className="text-sm font-medium text-[#C3703C]/80">Bienvenido a De Cuadros</p>
                        </div>
                    </div>
                    <Link href="/app/profile" className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#C3703C]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#171412]">notifications</span>
                    </Link>
                </div>

                {/* ── XP Progress Bar ── */}
                <div className="max-w-lg mx-auto w-full mt-2 flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm border border-[#C3703C]/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#C3703C]">Nivel {p.tier}</span>
                        <span className="text-xs font-bold text-[#D4AF37]">{p.points} / {p.nextTierMin || '∞'} XP</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#C3703C]/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#C3703C] to-[#D4AF37]" style={{ width: `${p.progress}%`, boxShadow: '0 0 8px rgba(212,175,55,0.4)' }}></div>
                    </div>
                    <p className="text-[11px] text-[#827268]">Próximo nivel: <span className="font-bold">{p.nextTier || 'MAX'}</span></p>
                </div>
            </header>

            <div className="max-w-lg mx-auto w-full">
                {/* ── Streak Hero Card ── */}
                <section className="px-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C3703C] to-[#D4AF37] p-6 text-white shadow-xl">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10">
                            <span className="material-symbols-outlined text-[120px]">local_fire_department</span>
                        </div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                                <h2 className="text-lg font-bold">{p.streak} días seguidos</h2>
                            </div>
                            <p className="text-sm font-medium opacity-90">¡Tu racha está que arde! Sigue así para desbloquear una tapa gratis.</p>
                            <div className="flex justify-between mt-2">
                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => {
                                    const isActive = i < (p.streak % 7 || 7)
                                    const isToday = i === (p.streak % 7)
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${isToday
                                                ? 'bg-white text-[#C3703C] border-white shadow-sm'
                                                : isActive
                                                    ? 'bg-white/20 border-white/30 backdrop-blur-sm'
                                                    : 'bg-white/10 border-white/20'
                                                }`}>{d}</div>
                                            <span className="material-symbols-outlined text-[14px]" style={{ opacity: isActive && !isToday ? 1 : 0.5 }}>
                                                {isActive && !isToday ? 'check_circle' : 'circle'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Quick Actions Grid ── */}
                <section className="mt-8 px-6">
                    <h3 className="mb-4 text-lg font-bold">Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 gap-4 stagger">
                        {[
                            { icon: 'menu_book', label: 'Carta', href: '/menu', color: '#6B705C', bg: 'rgba(107,112,92,0.1)' },
                            { icon: 'casino', label: 'Ruleta', href: '/app/wheel', color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' },
                            { icon: 'pets', label: 'Mascota', href: '/app/pet', color: '#C3703C', bg: 'rgba(195,112,60,0.1)' },
                            { icon: 'psychology', label: 'Chef AI', href: '/app/chatbot', color: '#1D2D44', bg: 'rgba(29,45,68,0.1)' },
                        ].map((a, i) => (
                            <Link key={i} href={a.href} className="flex flex-col gap-3 rounded-2xl p-4 border transition-all hover:shadow-md animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, background: a.bg, borderColor: `${a.color}15` }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: a.color }}>
                                    <span className="material-symbols-outlined">{a.icon}</span>
                                </div>
                                <span className="font-bold" style={{ color: a.color }}>{a.label}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── Daily Missions ── */}
                <section className="mt-8 px-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Misiones del Día</h3>
                        <span className="text-xs font-bold text-[#C3703C]">Ver todas</span>
                    </div>
                    <div className="flex flex-col gap-3 stagger">
                        {(missions.length > 0 ? missions : [
                            { id: '1', icon: 'check', text: 'Visítanos hoy', reward: 50, completed: true },
                            { id: '2', icon: 'restaurant', text: 'Prueba un plato nuevo', reward: 30, completed: false },
                            { id: '3', icon: 'lock', text: 'Cena con amigos', reward: 75, completed: false, locked: true },
                        ]).map((m: any, i: number) => {
                            if (m.locked) return (
                                <div key={m.id || i} className="flex items-center gap-4 rounded-2xl p-4 border border-dashed border-[#e4e0dd] animate-fade-in" style={{ background: 'rgba(244,242,241,0.5)' }}>
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#e4e0dd] text-[#827268] flex items-center justify-center">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-[#827268]">{m.text}</span>
                                        <p className="text-xs text-[#a09187]">Se desbloquea en Nivel 5</p>
                                    </div>
                                </div>
                            )
                            return (
                                <div key={m.id || i} className={`flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-[#C3703C]/5 animate-fade-in ${m.completed ? '' : ''}`}>
                                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${m.completed ? 'bg-green-100 text-green-600' : 'bg-[#C3703C]/10 text-[#C3703C]'}`}>
                                        <span className="material-symbols-outlined font-bold">{m.completed ? 'check' : (m.icon || 'restaurant')}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold">{m.text}</span>
                                            {!m.completed && <span className="text-[10px] font-bold text-[#C3703C]">0/1</span>}
                                        </div>
                                        {m.completed ? (
                                            <span className="text-xs text-[#827268]">¡Conseguido! +{m.reward} XP</span>
                                        ) : (
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#C3703C]/10">
                                                <div className="h-full rounded-full bg-[#C3703C]" style={{ width: '30%' }}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* ── Pet Preview ── */}
                {pet && (
                    <section className="mt-8 px-6">
                        <Link href="/app/pet" className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-[#C3703C]/5 hover:shadow-md transition-all">
                            <span className="text-4xl animate-float">{pet.emoji || '🥚'}</span>
                            <div className="flex-1">
                                <div className="font-bold text-sm">{pet.name || 'Pulpito'}</div>
                                <div className="text-xs text-[#827268]">{pet.stageName} · Humor {pet.mood}%</div>
                            </div>
                            <span className="material-symbols-outlined text-[#827268]">chevron_right</span>
                        </Link>
                    </section>
                )}
            </div>

            {/* ── Bottom Nav ── */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[#C3703C]/10 bg-white/90 px-6 pb-8 pt-3 backdrop-blur-md">
                <Link href="/app" className="flex flex-col items-center gap-1 text-[#C3703C]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
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
