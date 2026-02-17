// ═══ FOOD TRIVIA — Mediterranean ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const questions = [
    { q: '¿Cuál es el ingrediente principal de la paella valenciana?', a: ['Arroz', 'Pasta', 'Quinoa', 'Cuscús'], c: 0 },
    { q: '¿De qué país es originario el sushi?', a: ['China', 'Japón', 'Corea', 'Tailandia'], c: 1 },
    { q: '¿Qué especia da color amarillo al curry?', a: ['Pimentón', 'Azafrán', 'Cúrcuma', 'Canela'], c: 2 },
    { q: '¿Cuántos tipos de pasta italiana existen?', a: ['Más de 100', 'Menos de 50', 'Exactamente 75', 'Menos de 30'], c: 0 },
    { q: '¿Qué fruta es la base del guacamole?', a: ['Mango', 'Aguacate', 'Papaya', 'Plátano'], c: 1 },
    { q: '¿De dónde es el hummus?', a: ['India', 'Grecia', 'Oriente Medio', 'México'], c: 2 },
    { q: '¿Qué queso se usa en la tiramisú?', a: ['Ricotta', 'Mozzarella', 'Mascarpone', 'Parmesano'], c: 2 },
    { q: '¿Cuál es la temperatura ideal del vino tinto?', a: ['5-8°C', '10-12°C', '16-18°C', '20-22°C'], c: 2 },
    { q: '¿Qué país produce más aceite de oliva?', a: ['Italia', 'Grecia', 'España', 'Portugal'], c: 2 },
    { q: '¿El gazpacho se sirve...?', a: ['Caliente', 'Frío', 'Templado', 'Congelado'], c: 1 },
    { q: '¿Qué es el mise en place?', a: ['Un plato francés', 'Preparar ingredientes antes de cocinar', 'Un tipo de cuchillo', 'Una técnica de horneado'], c: 1 },
    { q: '¿Qué hierba aromática es típica del pesto?', a: ['Perejil', 'Cilantro', 'Albahaca', 'Romero'], c: 2 },
    { q: '¿De qué cereal se hace la cerveza?', a: ['Trigo', 'Centeno', 'Cebada', 'Avena'], c: 2 },
    { q: '¿Qué es un roux?', a: ['Un postre', 'Base de mantequilla y harina', 'Un vino', 'Un corte de carne'], c: 1 },
    { q: '¿Cuántos puntos Michelin es el máximo?', a: ['2', '3', '4', '5'], c: 1 },
    { q: '¿Qué es el umami?', a: ['Un plato japonés', 'El quinto sabor básico', 'Un tipo de sushi', 'Una salsa'], c: 1 },
    { q: '¿De dónde viene el chocolate?', a: ['África', 'Asia', 'Mesoamérica', 'Europa'], c: 2 },
    { q: '¿Qué aceite se usa en la dieta mediterránea?', a: ['Girasol', 'Coco', 'Oliva', 'Palma'], c: 2 },
    { q: '¿Qué temperatura tiene el punto de humo del AOVE?', a: ['120°C', '160°C', '207°C', '250°C'], c: 2 },
    { q: '¿Cuál es la madre de todas las salsas?', a: ['Ketchup', 'Bechamel', 'Mayonesa', 'Vinagreta'], c: 1 },
]

export default function TriviaPage() {
    const [qi, setQi] = useState(0)
    const [score, setScore] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [timer, setTimer] = useState(15)
    const [done, setDone] = useState(false)
    const [shuffled] = useState(() => [...questions].sort(() => Math.random() - 0.5))

    useEffect(() => {
        if (done || selected !== null) return
        const t = setInterval(() => setTimer(p => { if (p <= 1) { handleAnswer(-1); return 15 } return p - 1 }), 1000)
        return () => clearInterval(t)
    }, [qi, selected, done])

    const handleAnswer = (i: number) => {
        if (selected !== null) return
        setSelected(i)
        const newScore = i === shuffled[qi].c ? score + (10 + Math.floor(timer * 2)) : score
        if (i === shuffled[qi].c) setScore(newScore)
        setTimeout(() => {
            if (qi + 1 >= shuffled.length) {
                setDone(true)
                fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'game_end', data: { game: 'trivia', score: newScore } }) }).catch(() => { })
            } else { setQi(p => p + 1); setSelected(null); setTimer(15) }
        }, 1200)
    }

    const q = shuffled[qi]

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <Link href="/app/arcade" className="self-start text-sm text-[#9A9A9A] hover:text-[#5B7A5E] mb-4">← Arcade</Link>

            {!done ? (
                <div className="w-full max-w-md animate-fade-in" key={qi}>
                    <div className="flex items-center justify-between mb-4 text-sm">
                        <span className="text-[#9A9A9A]">{qi + 1}/{shuffled.length}</span>
                        <span className="font-bold text-[#5B7A5E]">{score} pts</span>
                        <span className={`font-bold ${timer <= 5 ? 'text-[#C4764E]' : 'text-[#6B6B6B]'}`}>⏱ {timer}s</span>
                    </div>
                    <div className="progress-bar mb-6"><div className="progress-fill" style={{ width: `${(qi / shuffled.length) * 100}%` }}></div></div>
                    <div className="card-marble mb-4">
                        <h2 className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{q.q}</h2>
                    </div>
                    <div className="space-y-2.5 stagger">
                        {q.a.map((a, i) => {
                            let bg = 'bg-white border-[#EDE9E0]'
                            if (selected !== null) {
                                if (i === q.c) bg = 'bg-[#5B7A5E]/10 border-[#5B7A5E]'
                                else if (i === selected) bg = 'bg-[#C4764E]/10 border-[#C4764E]'
                            }
                            return (
                                <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                                    className={`w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all animate-fade-in ${bg} ${selected === null ? 'hover:border-[#5B7A5E]/40 hover:bg-[#5B7A5E]/5' : ''}`}>
                                    <span className="text-[#9A9A9A] mr-2">{String.fromCharCode(65 + i)}.</span> {a}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="card-marble text-center max-w-sm animate-slide-up">
                    <div className="text-5xl mb-3">🧠</div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{score} puntos</h2>
                    <p className="text-[#9A9A9A] text-sm mt-1 mb-4">{score > 400 ? '¡Eres un experto!' : score > 200 ? 'Buen resultado' : 'Sigue practicando'}</p>
                    <button onClick={() => { setQi(0); setScore(0); setSelected(null); setTimer(15); setDone(false) }} className="btn-olive">Jugar otra vez</button>
                </div>
            )}
        </div>
    )
}
