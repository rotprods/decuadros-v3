// ═══ PROFILE — Mediterranean Stitch Redesign ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/gamification').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDFBF7' }}>
            <span className="material-symbols-outlined text-3xl text-[#C3703C] animate-pulse">person</span>
        </div>
    )

    const p = data?.profile || { name: 'Roberto Ortega', avatar: '😎', tier: 'NOVATO', points: 0, totalXP: 0, streak: 0, bestStreak: 0, rank: 0, progress: 0, nextTier: 'FOODIE', nextTierMin: 200 }
    const badges = data?.badges || { unlocked: [], total: 0 }
    const stats = data?.stats || { gamesPlayed: 0, arcadePoints: 0, orderCount: 0, totalSpent: 0 }
    const season = data?.season || { xp: 0, level: 0 }

    return (
        <div className="min-h-screen azulejo-pattern pb-28" style={{ background: '#FDFBF7' }}>
            {/* Header */}
            <header className="p-6">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <Link href="/app" className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#C3703C]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#171412]">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-extrabold tracking-tight">Mi Perfil</h1>
                    <Link href="#" className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#C3703C]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#171412]">settings</span>
                    </Link>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-6">
                {/* Profile Hero Card */}
                <div className="card text-center mb-6 animate-fade-in !pt-8 !pb-6">
                    {/* Avatar with Azulejo Border */}
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#C3703C] to-[#D4AF37]">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C3703C]/80 to-[#D4AF37]/80 flex items-center justify-center text-3xl text-white font-bold">
                                {p.name?.charAt(0) || 'R'}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-[18px] text-[#4CAF50]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-extrabold">{p.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="tier-badge">🏆 {p.tier}</span>
                    </div>
                    <p className="text-xs text-[#827268] mt-2">Nivel 12 · Miembro desde Enero 2024</p>

                    {/* XP Progress */}
                    <div className="mt-4 px-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-[#C3703C]">{p.tier}</span>
                            <span className="font-bold text-[#D4AF37]">{p.points} / {p.nextTierMin || '∞'} XP</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#C3703C]/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#C3703C] to-[#D4AF37]" style={{ width: `${p.progress}%`, boxShadow: '0 0 8px rgba(212,175,55,0.4)' }}></div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6 stagger">
                    {[
                        { icon: 'local_fire_department', label: 'Racha', value: `${p.streak} días`, color: '#C3703C' },
                        { icon: 'star', label: 'Puntos', value: p.points.toLocaleString(), color: '#D4AF37' },
                        { icon: 'military_tech', label: 'Logros', value: `${badges.unlocked.length}/${badges.total || 30}`, color: '#6B705C' },
                    ].map((s, i) => (
                        <div key={i} className="card text-center !p-4 animate-fade-in" style={{ borderColor: `${s.color}15` }}>
                            <span className="material-symbols-outlined text-2xl" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                            <div className="text-lg font-extrabold mt-1">{s.value}</div>
                            <div className="text-[10px] text-[#827268] font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Achievements Grid */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold mb-3">Logros Destacados</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { name: 'Primer Pedido', icon: 'shopping_bag', unlocked: true },
                            { name: 'Racha de 7', icon: 'local_fire_department', unlocked: true },
                            { name: 'Chef Experto', icon: 'restaurant', unlocked: true },
                            { name: 'Social', icon: 'group', unlocked: true },
                            { name: 'Coleccionista', icon: 'collections_bookmark', unlocked: true },
                            { name: 'Leyenda', icon: 'emoji_events', unlocked: false },
                        ].map((ach, i) => (
                            <div key={i} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${ach.unlocked
                                ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20'
                                : 'bg-[#f4f2f1] border-[#e4e0dd]'
                                }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ach.unlocked ? 'text-[#D4AF37]' : 'text-[#a09187]'}`}>
                                    <span className="material-symbols-outlined" style={ach.unlocked ? { fontVariationSettings: "'FILL' 1" } : {}}>{ach.icon}</span>
                                </div>
                                <span className={`text-[10px] font-bold text-center ${ach.unlocked ? 'text-[#171412]' : 'text-[#a09187]'}`}>{ach.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Season Pass */}
                <div className="card-accent mb-6 rounded-2xl animate-slide-up">
                    <div className="absolute right-4 top-4 opacity-20">
                        <span className="material-symbols-outlined text-[60px]">beach_access</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-extrabold">🏖️ Temporada Mediterránea</h3>
                        <p className="text-sm opacity-80 mt-1">Nivel {season.level} / 10</p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20 mt-3">
                            <div className="h-full rounded-full bg-white" style={{ width: `${(season.xp / (season.nextLevelXP || 100)) * 100}%` }}></div>
                        </div>
                        <button className="mt-4 bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-2 text-sm font-bold transition-all backdrop-blur-sm">
                            Ver Recompensas →
                        </button>
                    </div>
                </div>

                {/* Settings Links */}
                <div className="card !p-0 mb-6 overflow-hidden">
                    {[
                        { icon: 'edit', label: 'Editar Perfil' },
                        { icon: 'receipt_long', label: 'Mis Pedidos' },
                        { icon: 'confirmation_number', label: 'Cupones' },
                        { icon: 'settings', label: 'Configuración' },
                        { icon: 'logout', label: 'Cerrar Sesión', danger: true },
                    ].map((item, i) => (
                        <Link key={i} href="#" className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#FDFBF7] ${i < 4 ? 'border-b border-[#f4f2f1]' : ''}`}>
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-[20px] ${item.danger ? 'text-red-400' : 'text-[#827268]'}`}>{item.icon}</span>
                                <span className={`text-sm font-medium ${item.danger ? 'text-red-400' : ''}`}>{item.label}</span>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-[#d4d0cc]">chevron_right</span>
                        </Link>
                    ))}
                </div>

                {/* Summary Card */}
                <div className="card mb-6">
                    <h3 className="font-bold text-sm mb-3">💰 Resumen</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#827268]">Total gastado</span><span className="font-bold text-[#6B705C]">{stats.totalSpent?.toFixed(2) || '0.00'}€</span></div>
                        <div className="flex justify-between"><span className="text-[#827268]">XP total</span><span className="font-bold">{p.totalXP}</span></div>
                        <div className="flex justify-between"><span className="text-[#827268]">Mejor racha</span><span className="font-bold">{p.bestStreak} días</span></div>
                        <div className="flex justify-between"><span className="text-[#827268]">Partidas jugadas</span><span className="font-bold">{stats.gamesPlayed}</span></div>
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
                <Link href="/app/profile" className="flex flex-col items-center gap-1 text-[#C3703C]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight">Perfil</span>
                </Link>
            </nav>
        </div>
    )
}
