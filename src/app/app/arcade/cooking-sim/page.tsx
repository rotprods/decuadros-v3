// ═══ COOKING SIM — Improved + Mediterranean ═══
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Phase = 'crack' | 'beat' | 'pour' | 'cook' | 'flip' | 'plate' | 'garnish' | 'done'
const phases: Phase[] = ['crack', 'beat', 'pour', 'cook', 'flip', 'plate', 'garnish']
const phaseLabels: Record<Phase, string> = { crack: '🥚 Romper Huevos', beat: '🥄 Batir', pour: '🍳 Verter', cook: '🔥 Cocinar', flip: '🔄 Dar la vuelta', plate: '🍽️ Emplatar', garnish: '🌿 Decorar', done: '✅ Fin' }

export default function CookingSimPage() {
    const [started, setStarted] = useState(false)
    const [phase, setPhase] = useState<Phase>('crack')
    const [scores, setScores] = useState<Record<string, number>>({})
    const [progress, setProgress] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [total, setTotal] = useState(0)

    // Phase-specific state
    const [eggs, setEggs] = useState(0)
    const [beatCount, setBeatCount] = useState(0)
    const [temp, setTemp] = useState(5)
    const [cookTime, setCookTime] = useState(0)
    const [flipTiming, setFlipTiming] = useState(50)
    const [flipDir, setFlipDir] = useState(1)
    const [platePos, setPlatePos] = useState(50)
    const [garnishes, setGarnishes] = useState(0)

    const advancePhase = useCallback((score: number) => {
        setScores(p => ({ ...p, [phase]: score }))
        setFeedback(score >= 80 ? '¡Perfecto! 🌟' : score >= 50 ? '¡Bien! 👍' : 'Mejorable 😅')
        setTimeout(() => {
            setFeedback('')
            const idx = phases.indexOf(phase)
            if (idx < phases.length - 1) {
                setPhase(phases[idx + 1])
                setProgress(((idx + 1) / phases.length) * 100)
            } else {
                setPhase('done')
                const t = Object.values({ ...scores, [phase]: score }).reduce((a, b) => a + b, 0)
                setTotal(t)
                fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'game_end', data: { game: 'boss', score: t } }) }).catch(() => { })
            }
        }, 1200)
    }, [phase, scores])

    // Keyboard
    useEffect(() => {
        if (!started || phase === 'done') return
        const handleKey = (e: KeyboardEvent) => {
            e.preventDefault()
            switch (phase) {
                case 'crack':
                    if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) { setEggs(p => { const n = p + 1; if (n >= 3) advancePhase(100); return n }) }
                    break
                case 'beat':
                    if (e.code === 'Space' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') { setBeatCount(p => { const n = p + 1; if (n >= 20) advancePhase(Math.min(100, Math.round(n * 5))); return n }) }
                    break
                case 'pour':
                    if (e.code === 'Enter') advancePhase(90)
                    break
                case 'cook':
                    if (e.code === 'ArrowUp') setTemp(p => Math.min(10, p + 1))
                    if (e.code === 'ArrowDown') setTemp(p => Math.max(0, p - 1))
                    if (e.code === 'Enter') { const ideal = Math.abs(temp - 7); advancePhase(Math.max(20, 100 - ideal * 15)) }
                    break
                case 'flip':
                    if (e.code === 'KeyF') { const accuracy = 100 - Math.abs(flipTiming - 50) * 2; advancePhase(Math.max(10, accuracy)) }
                    break
                case 'plate':
                    if (e.code === 'ArrowLeft') setPlatePos(p => Math.max(0, p - 5))
                    if (e.code === 'ArrowRight') setPlatePos(p => Math.min(100, p + 5))
                    if (e.code === 'Enter') { const accuracy = 100 - Math.abs(platePos - 50) * 2; advancePhase(Math.max(10, accuracy)) }
                    break
                case 'garnish':
                    if (e.code === 'KeyP') { setGarnishes(p => { const n = p + 1; if (n >= 5) advancePhase(100); return n }) }
                    break
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [started, phase, temp, flipTiming, platePos, advancePhase])

    // Flip timing animation
    useEffect(() => {
        if (phase !== 'flip' || !started) return
        const t = setInterval(() => setFlipTiming(p => { let n = p + flipDir * 2; if (n >= 100 || n <= 0) setFlipDir(d => -d); return Math.max(0, Math.min(100, n)) }), 30)
        return () => clearInterval(t)
    }, [phase, started, flipDir])

    // Cook timer
    useEffect(() => {
        if (phase !== 'cook' || !started) return
        const t = setInterval(() => setCookTime(p => p + 1), 1000)
        return () => clearInterval(t)
    }, [phase, started])

    const rating = total >= 500 ? '⭐⭐⭐' : total >= 350 ? '⭐⭐' : '⭐'

    if (!started) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <Link href="/app/arcade" className="self-start text-sm text-[#9A9A9A] hover:text-[#5B7A5E] mb-4">← Arcade</Link>
            <div className="card-marble max-w-md w-full text-center animate-slide-up">
                <div className="text-5xl mb-4">🍳</div>
                <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Tortilla del Chef</h1>
                <p className="text-sm text-[#6B6B6B] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>Cocina la tortilla española perfecta en 7 fases</p>
                <div className="text-left text-sm text-[#6B6B6B] space-y-1.5 mb-6 p-4 bg-[#F3F0EA] rounded-xl">
                    <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#EDE9E0]">1 2 3</kbd> Romper huevos</p>
                    <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#EDE9E0]">Space ← →</kbd> Batir</p>
                    <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#EDE9E0]">Enter</kbd> Verter / Confirmar</p>
                    <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#EDE9E0]">↑ ↓</kbd> Temperatura</p>
                    <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#EDE9E0]">F</kbd> Dar la vuelta</p>
                    <p><kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-[#EDE9E0]">P</kbd> Decorar con perejil</p>
                </div>
                <button onClick={() => setStarted(true)} className="btn-olive w-full">🍳 ¡A cocinar!</button>
            </div>
        </div>
    )

    if (phase === 'done') return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <div className="card-marble max-w-md w-full text-center animate-slide-up">
                <div className="text-5xl mb-3">{rating}</div>
                <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{total} pts</h2>
                <p className="text-[#6B6B6B] mt-1 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                    {total >= 500 ? '¡Chef Estrella Michelin!' : total >= 350 ? '¡Buen cocinero!' : 'Sigue practicando'}
                </p>
                <div className="space-y-1.5 mb-6 text-sm text-left">
                    {phases.map(p => (
                        <div key={p} className="flex justify-between p-2 bg-[#F3F0EA] rounded-lg">
                            <span>{phaseLabels[p]}</span>
                            <span className="font-bold text-[#5B7A5E]">{scores[p] || 0}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => { setStarted(false); setPhase('crack'); setScores({}); setProgress(0); setEggs(0); setBeatCount(0); setTemp(5); setCookTime(0); setFlipTiming(50); setPlatePos(50); setGarnishes(0) }} className="btn-olive w-full">Cocinar otra vez</button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-[#9A9A9A]">{phases.indexOf(phase) + 1}/{phases.length}</span>
                    <span className="font-bold text-[#5B7A5E]">{phaseLabels[phase]}</span>
                </div>
                <div className="progress-bar mb-6"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>

                {feedback && (
                    <div className="text-center text-2xl font-bold mb-4 animate-fade-scale">{feedback}</div>
                )}

                <div className="card-marble text-center min-h-[200px] flex flex-col items-center justify-center animate-fade-in" key={phase}>
                    {phase === 'crack' && (
                        <>
                            <div className="text-6xl mb-4">{['🥚', '🥚🥚', '🥚🥚🥚'][Math.min(eggs, 2)]}</div>
                            <p className="text-sm text-[#6B6B6B]">Pulsa <b>1, 2, 3</b> para romper {3 - eggs} huevo{3 - eggs !== 1 ? 's' : ''}</p>
                            <div className="flex gap-2 mt-3">{[0, 1, 2].map(i => <div key={i} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl transition-all ${i < eggs ? 'border-[#5B7A5E] bg-[#5B7A5E]/10 scale-110' : 'border-[#EDE9E0]'}`}>{i < eggs ? '✓' : '🥚'}</div>)}</div>
                        </>
                    )}
                    {phase === 'beat' && (
                        <>
                            <div className="text-6xl mb-4" style={{ transform: `rotate(${beatCount * 18}deg)` }}>🥄</div>
                            <div className="w-full bg-[#F3F0EA] h-3 rounded-full overflow-hidden"><div className="h-full bg-[#C5A55A] rounded-full transition-all" style={{ width: `${Math.min(100, beatCount * 5)}%` }}></div></div>
                            <p className="text-sm text-[#6B6B6B] mt-3">Pulsa <b>Space + ← →</b> para batir ({beatCount}/20)</p>
                        </>
                    )}
                    {phase === 'pour' && (
                        <>
                            <div className="text-6xl mb-4 animate-float">🍳</div>
                            <p className="text-sm text-[#6B6B6B]">Pulsa <b>Enter</b> para verter la mezcla en la sartén</p>
                        </>
                    )}
                    {phase === 'cook' && (
                        <>
                            <div className="text-6xl mb-2">🔥</div>
                            <div className="w-full flex items-center gap-3 mb-3">
                                <span className="text-xs text-[#9A9A9A]">Bajo</span>
                                <div className="flex-1 bg-[#F3F0EA] h-4 rounded-full overflow-hidden relative">
                                    <div className="absolute top-0 h-full bg-gradient-to-r from-[#5B7A5E] via-[#C5A55A] to-[#C4764E] rounded-full transition-all" style={{ width: `${temp * 10}%` }}></div>
                                    <div className="absolute top-0 h-full border-l-2 border-[#5B7A5E] border-dashed" style={{ left: '70%' }}></div>
                                </div>
                                <span className="text-xs text-[#9A9A9A]">Alto</span>
                            </div>
                            <p className="text-sm text-[#6B6B6B]">Temperatura: <b className={temp >= 6 && temp <= 8 ? 'text-[#5B7A5E]' : 'text-[#C4764E]'}>{temp}/10</b> · Ideal: 7 · Tiempo: {cookTime}s</p>
                            <p className="text-xs text-[#9A9A9A] mt-1">Ajusta con <b>↑ ↓</b> y pulsa <b>Enter</b></p>
                        </>
                    )}
                    {phase === 'flip' && (
                        <>
                            <div className="text-6xl mb-4" style={{ transform: `scaleY(${1 - Math.abs(flipTiming - 50) / 100})` }}>🍳</div>
                            <div className="w-full bg-[#F3F0EA] h-4 rounded-full overflow-hidden relative mb-3">
                                <div className="absolute top-0 h-full bg-[#C5A55A] rounded-full transition-all" style={{ width: `${flipTiming}%` }}></div>
                                <div className="absolute top-0 left-[48%] w-[4%] h-full bg-[#5B7A5E] rounded-full"></div>
                            </div>
                            <p className="text-sm text-[#6B6B6B]">¡Pulsa <b>F</b> en el centro para la vuelta perfecta!</p>
                        </>
                    )}
                    {phase === 'plate' && (
                        <>
                            <div className="relative w-full h-16 mb-4">
                                <div className="absolute text-4xl transition-all" style={{ left: `${platePos}%`, transform: 'translateX(-50%)' }}>🍽️</div>
                                <div className="absolute text-xl top-2" style={{ left: '50%', transform: 'translateX(-50%)' }}>⬇️</div>
                            </div>
                            <p className="text-sm text-[#6B6B6B]">Centra el plato con <b>← →</b> y pulsa <b>Enter</b></p>
                        </>
                    )}
                    {phase === 'garnish' && (
                        <>
                            <div className="text-6xl mb-4">🌿</div>
                            <div className="flex gap-2 mb-3">{[0, 1, 2, 3, 4].map(i => <span key={i} className={`text-2xl transition-all ${i < garnishes ? 'opacity-100 scale-110' : 'opacity-20'}`}>🌿</span>)}</div>
                            <p className="text-sm text-[#6B6B6B]">Pulsa <b>P</b> cinco veces para decorar ({garnishes}/5)</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
