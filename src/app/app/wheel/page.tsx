// ═══ WHEEL — Mediterranean Stitch Redesign ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const PRIZES = [
    { text: '50 XP', color: '#6B705C', emoji: '✨', icon: 'stars' },
    { text: '10% Dto', color: '#D4AF37', emoji: '🎫', icon: 'confirmation_number' },
    { text: '100 XP', color: '#5B8FC4', emoji: '💎', icon: 'diamond' },
    { text: 'Postre', color: '#C3703C', emoji: '🍮', icon: 'cake' },
    { text: '25 XP', color: '#8A9078', emoji: '⭐', icon: 'grade' },
    { text: 'Café', color: '#8B6BB5', emoji: '☕', icon: 'coffee' },
    { text: '200 XP', color: '#1D2D44', emoji: '🏆', icon: 'emoji_events' },
    { text: '15% Dto', color: '#D4AF37', emoji: '🎁', icon: 'redeem' },
]

export default function WheelPage() {
    const [spinning, setSpinning] = useState(false)
    const [angle, setAngle] = useState(0)
    const [result, setResult] = useState<any>(null)
    const [cooldown, setCooldown] = useState(false)
    const [coins, setCoins] = useState(120)

    useEffect(() => {
        fetch('/api/gamification').then(r => r.json()).then(d => {
            if (d?.wheel?.lastSpin) {
                const elapsed = Date.now() - new Date(d.wheel.lastSpin).getTime()
                if (elapsed < (d.wheel.cooldownMs || 3600000)) setCooldown(true)
            }
            if (d?.profile?.points) setCoins(d.profile.points)
        }).catch(() => { })
    }, [])

    const spin = async () => {
        if (spinning || cooldown) return
        setSpinning(true); setResult(null)

        try {
            const res = await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'spin_wheel' }) })
            const data = await res.json()
            const extraRounds = 5 * 360
            const prizeAngle = Math.random() * 360
            const totalAngle = angle + extraRounds + prizeAngle
            setAngle(totalAngle)
            setTimeout(() => { setResult(data); setSpinning(false); setCooldown(true) }, 4000)
        } catch {
            const extraRounds = 5 * 360
            const prizeAngle = Math.random() * 360
            setAngle(angle + extraRounds + prizeAngle)
            setTimeout(() => {
                const idx = Math.floor((prizeAngle % 360) / 45)
                setResult({ prize: PRIZES[idx % PRIZES.length].text, xpEarned: 0 })
                setSpinning(false)
            }, 4000)
        }
    }

    return (
        <div className="min-h-screen azulejo-pattern pb-28" style={{ background: '#FDFBF7' }}>
            {/* Header */}
            <header className="p-6">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <Link href="/app" className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#C3703C]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#171412]">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-extrabold tracking-tight">La Ruleta</h1>
                    <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 rounded-full px-3 py-1.5 border border-[#D4AF37]/20">
                        <span className="material-symbols-outlined text-[16px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                        <span className="text-sm font-bold text-[#D4AF37]">{coins}</span>
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-6">
                {/* Spin Counter */}
                <div className="text-center mb-6">
                    <p className="text-sm font-medium text-[#827268]">Gira la ruleta para ganar premios</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[16px] text-[#C3703C]">casino</span>
                        <span className="text-xs font-bold text-[#C3703C]">{cooldown ? '0' : '1'} giro disponible</span>
                    </div>
                </div>

                {/* Wheel */}
                <div className="relative mb-8 animate-fade-in flex items-center justify-center">
                    {/* Pointer */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
                        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#C3703C]" style={{ filter: 'drop-shadow(0 2px 4px rgba(195,112,60,0.3))' }}></div>
                    </div>
                    <div className="w-72 h-72 rounded-full border-4 border-[#C3703C]/20 shadow-xl relative overflow-hidden bg-white"
                        style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}>
                        {PRIZES.map((p, i) => {
                            const rotate = i * 45
                            return (
                                <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${rotate}deg)` }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 origin-bottom flex flex-col items-center pt-6">
                                        <span className="material-symbols-outlined text-lg" style={{ color: p.color }}>{p.icon}</span>
                                        <span className="text-[9px] font-bold mt-1" style={{ color: p.color }}>{p.text}</span>
                                    </div>
                                </div>
                            )
                        })}
                        {/* Center */}
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#C3703C] to-[#D4AF37] flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-3xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
                        </div>
                    </div>
                </div>

                {/* Result */}
                {result && (
                    <div className="card-accent text-center mb-6 animate-slide-up max-w-xs mx-auto rounded-2xl">
                        <div className="text-3xl mb-2">🎉</div>
                        <div className="text-xl font-extrabold">{result.prize}</div>
                        {result.xpEarned > 0 && <p className="text-sm font-bold opacity-90 mt-1">+{result.xpEarned} XP</p>}
                        <p className="text-sm opacity-80 mt-1">¡Premio añadido a tu cuenta!</p>
                    </div>
                )}

                {/* Spin Button */}
                <div className="text-center">
                    <button onClick={spin} disabled={spinning || cooldown}
                        className={`w-full max-w-xs py-4 rounded-2xl font-bold text-white text-lg transition-all shadow-lg ${cooldown
                            ? 'bg-[#e4e0dd] text-[#827268] cursor-not-allowed shadow-none'
                            : spinning
                                ? 'bg-[#D4AF37] animate-pulse'
                                : 'bg-gradient-to-r from-[#C3703C] to-[#D4AF37] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                            }`}>
                        {cooldown ? '⏳ Vuelve más tarde' : spinning ? '🎡 Girando...' : '🎡 Girar Ruleta'}
                    </button>
                </div>
                {cooldown && !result && <p className="text-xs text-[#827268] mt-3 text-center">Puedes girar cada hora</p>}

                {/* Recent Wins Preview */}
                <div className="mt-8">
                    <h3 className="text-sm font-bold mb-3 text-[#827268]">Premios recientes</h3>
                    <div className="flex flex-col gap-2">
                        {['Ana ganó 100 XP', 'Carlos ganó Postre Gratis', 'María ganó 15% Dto'].map((win, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl bg-white/80 p-3 border border-[#C3703C]/5 text-sm">
                                <span className="material-symbols-outlined text-[16px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                                <span className="text-[#827268]">{win}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Nav (same as dashboard) */}
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
