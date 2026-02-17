// ═══ CATCH — Improved Physics + Mediterranean ═══
'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function CatchPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [state, setState] = useState<'menu' | 'playing' | 'over'>('menu')
    const [score, setScore] = useState(0)

    useEffect(() => {
        if (state !== 'playing') return
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        canvas.width = 400; canvas.height = 400

        let sc = 0, lives = 3, combo = 0, frame = 0
        const basket = { x: 180, w: 50, y: 370 }
        let items: { x: number, y: number, speed: number, type: 'good' | 'bad', emoji: string, rot: number, rotSpeed: number }[] = []
        let sparks: { x: number, y: number, vy: number, life: number, emoji: string }[] = []
        let mouseX = 200, alive = true, animId: number

        const goodEmojis = ['🍅', '🫒', '🧀', '🥚', '🍋', '🌿', '🫑', '🍇']
        const badEmojis = ['💀', '🦴', '☠️']

        const mm = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouseX = e.clientX - r.left }
        const tm = (e: TouchEvent) => { const r = canvas.getBoundingClientRect(); mouseX = e.touches[0].clientX - r.left; e.preventDefault() }
        canvas.addEventListener('mousemove', mm)
        canvas.addEventListener('touchmove', tm, { passive: false })

        const loop = () => {
            if (!alive) return
            ctx.fillStyle = '#FAF9F6'; ctx.fillRect(0, 0, 400, 400)

            // Spawn
            if (frame % Math.max(15, 35 - Math.floor(sc / 50)) === 0) {
                const bad = Math.random() < 0.15
                items.push({
                    x: Math.random() * 360 + 20, y: -20,
                    speed: 1.5 + Math.random() * 1.5 + sc * 0.005,
                    type: bad ? 'bad' : 'good',
                    emoji: bad ? badEmojis[Math.floor(Math.random() * badEmojis.length)] : goodEmojis[Math.floor(Math.random() * goodEmojis.length)],
                    rot: 0, rotSpeed: (Math.random() - 0.5) * 0.1
                })
            }

            // Basket — smooth follow
            basket.x += (mouseX - basket.x - basket.w / 2) * 0.15
            basket.x = Math.max(0, Math.min(400 - basket.w, basket.x))
            ctx.fillStyle = '#C5A55A'
            ctx.fillRect(basket.x, basket.y, basket.w, 20)
            ctx.fillRect(basket.x + 5, basket.y - 5, basket.w - 10, 5)
            ctx.fillStyle = '#2C2C2C'; ctx.font = '18px serif'; ctx.fillText('🧺', basket.x + basket.w / 2 - 9, basket.y + 16)

            // Items
            items.forEach(item => {
                item.y += item.speed
                item.rot += item.rotSpeed
                ctx.save()
                ctx.translate(item.x, item.y)
                ctx.rotate(item.rot)
                ctx.font = '22px serif'
                ctx.fillText(item.emoji, -11, 8)
                ctx.restore()

                // Catch
                if (item.y > basket.y - 10 && item.y < basket.y + 20 && item.x > basket.x - 10 && item.x < basket.x + basket.w + 10) {
                    if (item.type === 'good') {
                        combo++
                        const pts = 10 * Math.min(combo, 5)
                        sc += pts
                        sparks.push({ x: item.x, y: basket.y - 10, vy: -3, life: 25, emoji: `+${pts}` })
                    } else {
                        combo = 0; lives--
                        sparks.push({ x: item.x, y: basket.y - 10, vy: -2, life: 25, emoji: '❌' })
                        if (lives <= 0) { alive = false; setScore(sc); setState('over'); fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'game_end', data: { game: 'catch', score: sc } }) }).catch(() => { }) }
                    }
                    item.y = 999
                }

                // Miss good
                if (item.y > 420 && item.type === 'good') { combo = 0 }
            })
            items = items.filter(i => i.y < 420)

            // Sparks
            sparks.forEach(s => {
                s.y += s.vy; s.life--
                ctx.globalAlpha = s.life / 25
                ctx.fillStyle = s.emoji.includes('+') ? '#5B7A5E' : '#C4764E'
                ctx.font = 'bold 14px Inter, sans-serif'
                ctx.fillText(s.emoji, s.x - 10, s.y)
            })
            ctx.globalAlpha = 1
            sparks = sparks.filter(s => s.life > 0)

            // HUD
            ctx.fillStyle = '#2C2C2C'; ctx.font = 'bold 16px Inter, sans-serif'
            ctx.fillText(`${sc}`, 10, 25)
            ctx.fillText('❤️'.repeat(lives), 330, 25)
            if (combo > 1) { ctx.fillStyle = '#C5A55A'; ctx.font = 'bold 13px Inter'; ctx.fillText(`x${combo} combo`, 10, 45) }

            frame++
            animId = requestAnimationFrame(loop)
        }
        animId = requestAnimationFrame(loop)
        return () => { alive = false; cancelAnimationFrame(animId); canvas.removeEventListener('mousemove', mm); canvas.removeEventListener('touchmove', tm) }
    }, [state])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <Link href="/app/arcade" className="self-start text-sm text-[#9A9A9A] hover:text-[#5B7A5E] mb-4">← Arcade</Link>
            <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>🧺 Atrapacomida</h1>
            {state === 'menu' && (
                <div className="card-marble text-center max-w-sm animate-fade-in">
                    <p className="text-sm text-[#6B6B6B] mb-4">Mueve el ratón para atrapar ingredientes. ¡Evita las calaveras!</p>
                    <button onClick={() => setState('playing')} className="btn-olive">¡A jugar!</button>
                </div>
            )}
            {state === 'playing' && <div className="game-container animate-fade-scale"><canvas ref={canvasRef} style={{ width: 400, height: 400 }} /></div>}
            {state === 'over' && (
                <div className="card-marble text-center max-w-sm animate-fade-in">
                    <div className="text-4xl mb-3">🧺</div>
                    <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{score} pts</div>
                    <button onClick={() => setState('playing')} className="btn-olive mt-4">Reintentar</button>
                </div>
            )}
        </div>
    )
}
