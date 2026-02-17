// ═══ BURGER DASH — Improved Physics + Mediterranean Design ═══
'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function BurgerDashPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'over'>('menu')
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(0)

    useEffect(() => {
        if (gameState !== 'playing') return
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        canvas.width = 400; canvas.height = 300

        let frame = 0, sc = 0, speed = 3, groundY = 250
        const chef = { x: 60, y: groundY, w: 30, h: 40, vy: 0, jumping: false, ducking: false }
        const gravity = 0.6, jumpForce = -11
        let obstacles: { x: number, y: number, w: number, h: number, type: string }[] = []
        let particles: { x: number, y: number, vx: number, vy: number, life: number, color: string }[] = []
        let animId: number, alive = true

        const colors = { ground: '#5B7A5E', sky: '#FAF9F6', obstacle: '#C4764E', chef: '#C5A55A' }

        const spawnObstacle = () => {
            const type = Math.random() > 0.4 ? 'crate' : 'bird'
            obstacles.push({
                x: 420,
                y: type === 'bird' ? groundY - 50 - Math.random() * 30 : groundY,
                w: type === 'bird' ? 25 : 20 + Math.random() * 15,
                h: type === 'bird' ? 20 : 25 + Math.random() * 20,
                type
            })
        }

        const addParticles = (x: number, y: number, color: string) => {
            for (let i = 0; i < 8; i++) {
                particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 5, life: 30, color })
            }
        }

        const keys = new Set<string>()
        const kd = (e: KeyboardEvent) => { keys.add(e.code); e.preventDefault() }
        const ku = (e: KeyboardEvent) => { keys.delete(e.code); if (e.code === 'ArrowDown') chef.ducking = false }
        window.addEventListener('keydown', kd)
        window.addEventListener('keyup', ku)

        const loop = () => {
            if (!alive) return
            ctx.fillStyle = colors.sky; ctx.fillRect(0, 0, 400, 300)

            // Ground with texture
            ctx.fillStyle = colors.ground
            ctx.fillRect(0, groundY + chef.h, 400, 60)
            ctx.fillStyle = '#4A6B4D'
            for (let i = 0; i < 20; i++) {
                const gx = ((i * 25) - frame * speed * 0.5) % 400
                ctx.fillRect(gx < 0 ? gx + 400 : gx, groundY + chef.h, 2, 8)
            }

            // Parallax bg - mountains
            ctx.fillStyle = '#E8E4DC'
            for (let i = 0; i < 5; i++) {
                const mx = ((i * 120) - frame * 0.3) % 600 - 100
                ctx.beginPath(); ctx.moveTo(mx, groundY + chef.h); ctx.lineTo(mx + 60, groundY - 40); ctx.lineTo(mx + 120, groundY + chef.h); ctx.fill()
            }

            // Jump/duck
            if ((keys.has('Space') || keys.has('ArrowUp')) && !chef.jumping) { chef.vy = jumpForce; chef.jumping = true }
            if (keys.has('ArrowDown') && !chef.jumping) { chef.ducking = true }

            // Physics
            chef.vy += gravity
            chef.y += chef.vy
            if (chef.y >= groundY) { chef.y = groundY; chef.vy = 0; chef.jumping = false }

            // Chef draw
            const ch = chef.ducking ? 20 : 40
            const cy = chef.ducking ? groundY + 20 : chef.y
            ctx.fillStyle = colors.chef
            ctx.fillRect(chef.x, cy, chef.w, ch)
            ctx.fillStyle = '#2C2C2C'
            ctx.font = chef.ducking ? '16px serif' : '24px serif'
            ctx.fillText(chef.ducking ? '🏃' : '👨‍🍳', chef.x + 2, cy + ch - 4)

            // Obstacles
            if (frame % Math.max(40, 80 - Math.floor(sc / 200)) === 0) spawnObstacle()
            obstacles.forEach(o => {
                o.x -= speed
                ctx.fillStyle = o.type === 'bird' ? '#8B6BB5' : colors.obstacle
                ctx.fillRect(o.x, o.y - o.h, o.w, o.h)
                ctx.fillStyle = '#2C2C2C'
                ctx.font = '16px serif'
                ctx.fillText(o.type === 'bird' ? '🦅' : '📦', o.x + 1, o.y - 2)

                // Collision
                const hitbox = { x: chef.x + 4, y: cy + 4, w: chef.w - 8, h: ch - 8 }
                if (hitbox.x < o.x + o.w && hitbox.x + hitbox.w > o.x && hitbox.y < o.y && hitbox.y + hitbox.h > o.y - o.h) {
                    addParticles(chef.x, cy, colors.obstacle)
                    alive = false
                    setScore(sc); setGameState('over')
                    if (sc > highScore) setHighScore(sc)
                    fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'game_end', data: { game: 'dash', score: sc } }) }).catch(() => { })
                }
            })
            obstacles = obstacles.filter(o => o.x > -50)

            // Particles
            particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--; ctx.globalAlpha = p.life / 30; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4) })
            ctx.globalAlpha = 1
            particles = particles.filter(p => p.life > 0)

            // Score
            sc++; speed = 3 + sc * 0.003
            ctx.fillStyle = '#2C2C2C'; ctx.font = 'bold 16px Inter, sans-serif'; ctx.fillText(`${sc}`, 360, 25)

            frame++
            animId = requestAnimationFrame(loop)
        }
        animId = requestAnimationFrame(loop)
        return () => { alive = false; cancelAnimationFrame(animId); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku) }
    }, [gameState])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <Link href="/app/arcade" className="self-start text-sm text-[#9A9A9A] hover:text-[#5B7A5E] mb-4">← Arcade</Link>
            <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>🏃 Burger Dash</h1>

            {gameState === 'menu' && (
                <div className="card-marble text-center max-w-sm animate-fade-in">
                    <p className="text-sm text-[#6B6B6B] mb-4">Salta con <kbd className="px-2 py-0.5 bg-[#F3F0EA] rounded text-xs">Space</kbd> y agáchate con <kbd className="px-2 py-0.5 bg-[#F3F0EA] rounded text-xs">↓</kbd></p>
                    <button onClick={() => setGameState('playing')} className="btn-olive">¡Correr!</button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="game-container animate-fade-scale"><canvas ref={canvasRef} style={{ width: 400, height: 300 }} /></div>
            )}

            {gameState === 'over' && (
                <div className="card-marble text-center max-w-sm animate-fade-in">
                    <div className="text-4xl mb-3">💥</div>
                    <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{score} pts</div>
                    <div className="text-sm text-[#9A9A9A] mb-4">Mejor: {highScore}</div>
                    <button onClick={() => setGameState('playing')} className="btn-olive">Reintentar</button>
                </div>
            )}
        </div>
    )
}
