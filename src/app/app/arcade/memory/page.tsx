// ═══ MEMORY CHEF — Mediterranean ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const emojis4 = ['🫒', '🍅', '🧀', '🥚', '🍋', '🌿', '🫑', '🍇']
const emojis6 = [...emojis4, '🧄', '🫘', '🥖', '🍷', '🐟', '🥩', '🍯', '🫚', '🌶️', '🥑']

export default function MemoryPage() {
    const [size, setSize] = useState<4 | 6 | null>(null)
    const [cards, setCards] = useState<{ emoji: string, flipped: boolean, matched: boolean }[]>([])
    const [flipped, setFlipped] = useState<number[]>([])
    const [moves, setMoves] = useState(0)
    const [matches, setMatches] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [done, setDone] = useState(false)
    const [score, setScore] = useState(0)

    const startGame = (s: 4 | 6) => {
        setSize(s)
        const pool = s === 4 ? emojis4 : emojis6.slice(0, (s * s) / 2)
        const deck = [...pool, ...pool].sort(() => Math.random() - 0.5).map(emoji => ({ emoji, flipped: false, matched: false }))
        setCards(deck); setFlipped([]); setMoves(0); setMatches(0); setDone(false); setStartTime(Date.now())
    }

    const flip = (i: number) => {
        if (flipped.length >= 2 || cards[i].flipped || cards[i].matched) return
        const newCards = [...cards]; newCards[i].flipped = true; setCards(newCards)
        const newFlipped = [...flipped, i]; setFlipped(newFlipped)

        if (newFlipped.length === 2) {
            setMoves(p => p + 1)
            if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
                setTimeout(() => {
                    const c = [...cards]; c[newFlipped[0]].matched = true; c[newFlipped[1]].matched = true; setCards(c); setFlipped([])
                    const m = matches + 1; setMatches(m)
                    const total = size === 4 ? 8 : 18
                    if (m >= total) {
                        const elapsed = (Date.now() - startTime) / 1000
                        const sc = Math.max(50, Math.round(1000 - moves * 10 - elapsed * 2))
                        setScore(sc); setDone(true)
                        fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'game_end', data: { game: 'memory', score: sc } }) }).catch(() => { })
                    }
                }, 300)
            } else {
                setTimeout(() => { const c = [...cards]; c[newFlipped[0]].flipped = false; c[newFlipped[1]].flipped = false; setCards(c); setFlipped([]) }, 800)
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <Link href="/app/arcade" className="self-start text-sm text-[#9A9A9A] hover:text-[#5B7A5E] mb-4">← Arcade</Link>
            <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>🃏 Memory Chef</h1>

            {!size && (
                <div className="card-marble text-center max-w-sm animate-fade-in">
                    <p className="text-sm text-[#6B6B6B] mb-4">Elige la dificultad</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => startGame(4)} className="btn-olive">4×4 Fácil</button>
                        <button onClick={() => startGame(6)} className="btn-gold">6×6 Difícil</button>
                    </div>
                </div>
            )}

            {size && !done && (
                <div className="animate-fade-in">
                    <div className="flex justify-between text-sm mb-3 text-[#6B6B6B]">
                        <span>Movimientos: <b className="text-[#2C2C2C]">{moves}</b></span>
                        <span>Parejas: <b className="text-[#5B7A5E]">{matches}/{size === 4 ? 8 : 18}</b></span>
                    </div>
                    <div className={`grid gap-2 ${size === 4 ? 'grid-cols-4' : 'grid-cols-6'}`} style={{ maxWidth: size === 4 ? 280 : 360 }}>
                        {cards.map((c, i) => (
                            <button key={i} onClick={() => flip(i)}
                                className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-300 ${c.matched ? 'bg-[#5B7A5E]/10 border-2 border-[#5B7A5E] scale-95' :
                                    c.flipped ? 'bg-white border-2 border-[#C5A55A] scale-105 shadow-md' :
                                        'bg-[#F3F0EA] border-2 border-[#EDE9E0] hover:border-[#5B7A5E]/30 hover:bg-white'
                                    }`}
                                style={{ fontSize: size === 6 ? '18px' : '24px' }}>
                                {c.flipped || c.matched ? c.emoji : '?'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {done && (
                <div className="card-marble text-center max-w-sm animate-slide-up">
                    <div className="text-5xl mb-3">🎉</div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{score} puntos</h2>
                    <p className="text-sm text-[#9A9A9A] mt-1 mb-4">{moves} movimientos</p>
                    <button onClick={() => startGame(size!)} className="btn-olive">Jugar otra vez</button>
                </div>
            )}
        </div>
    )
}
