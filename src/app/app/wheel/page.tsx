// ═══ WHEEL — Mediterranean + Full API ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const PRIZES = [
    { text: '50 XP', color: '#5B7A5E', emoji: '✨' },
    { text: '10% Dto', color: '#C5A55A', emoji: '🎫' },
    { text: '100 XP', color: '#5B8FC4', emoji: '💎' },
    { text: 'Postre', color: '#C4764E', emoji: '🍮' },
    { text: '25 XP', color: '#8BA88E', emoji: '⭐' },
    { text: 'Café', color: '#8B6BB5', emoji: '☕' },
    { text: '200 XP', color: '#5B7A5E', emoji: '🏆' },
    { text: '15% Dto', color: '#C5A55A', emoji: '🎁' },
]

export default function WheelPage() {
    const [spinning, setSpinning] = useState(false)
    const [angle, setAngle] = useState(0)
    const [result, setResult] = useState<any>(null)
    const [cooldown, setCooldown] = useState(false)

    useEffect(() => {
        fetch('/api/gamification').then(r => r.json()).then(d => {
            if (d?.wheel?.lastSpin) {
                const elapsed = Date.now() - new Date(d.wheel.lastSpin).getTime()
                if (elapsed < (d.wheel.cooldownMs || 3600000)) setCooldown(true)
            }
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

            setTimeout(() => {
                setResult(data)
                setSpinning(false)
                setCooldown(true)
            }, 4000)
        } catch {
            // Fallback local spin
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <Link href="/app" className="self-start text-sm text-[#9A9A9A] hover:text-[#5B7A5E] mb-4">← App</Link>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>🎡 Ruleta Diaria</h1>

            <div className="relative mb-8 animate-fade-in">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-3xl">▼</div>
                <div className="w-72 h-72 rounded-full border-4 border-[#EDE9E0] shadow-lg relative overflow-hidden"
                    style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}>
                    {PRIZES.map((p, i) => {
                        const rotate = i * 45
                        return (
                            <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${rotate}deg)` }}>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 origin-bottom flex flex-col items-center pt-6">
                                    <span className="text-lg">{p.emoji}</span>
                                    <span className="text-[9px] font-bold mt-1" style={{ color: p.color }}>{p.text}</span>
                                </div>
                            </div>
                        )
                    })}
                    <div className="absolute inset-4 rounded-full bg-white/80 flex items-center justify-center">
                        <span className="text-3xl">🫒</span>
                    </div>
                </div>
            </div>

            {result && (
                <div className="card-marble text-center mb-6 animate-slide-up max-w-xs">
                    <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>🎉 {result.prize}</div>
                    {result.xpEarned > 0 && <p className="text-sm text-[#5B7A5E] font-bold mt-1">+{result.xpEarned} XP</p>}
                    <p className="text-sm text-[#9A9A9A] mt-1">¡Premio añadido a tu cuenta!</p>
                </div>
            )}

            <button onClick={spin} disabled={spinning || cooldown} className="btn-olive disabled:opacity-50">
                {cooldown ? '⏳ Vuelve más tarde' : spinning ? 'Girando...' : '🎡 Girar Ruleta'}
            </button>
            {cooldown && !result && <p className="text-xs text-[#9A9A9A] mt-2">Puedes girar cada hora</p>}
        </div>
    )
}
