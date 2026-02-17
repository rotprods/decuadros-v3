// ═══ ARCADE HUB — Mediterranean ═══
import Link from 'next/link'

const games = [
    { id: 'burger-dash', icon: '🏃', name: 'Burger Dash', desc: 'Corre y esquiva obstáculos a toda velocidad', color: '#C4764E' },
    { id: 'catch', icon: '🧺', name: 'Atrapacomida', desc: 'Recoge ingredientes frescos del cielo', color: '#5B7A5E' },
    { id: 'trivia', icon: '🧠', name: 'Food Trivia', desc: '20 preguntas sobre gastronomía mundial', color: '#C5A55A' },
    { id: 'memory', icon: '🃏', name: 'Memory Chef', desc: 'Encuentra las parejas de ingredientes', color: '#5B8FC4' },
    { id: 'cooking-sim', icon: '🍳', name: 'Tortilla del Chef', desc: 'Cocina la tortilla perfecta paso a paso', color: '#8B6BB5' },
]

export default function ArcadePage() {
    return (
        <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
                <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
                    <Link href="/app" className="text-[#9A9A9A] hover:text-[#5B7A5E] transition-colors">←</Link>
                    <h1 className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>🎮 Arcade</h1>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-5 py-6">
                <div className="card-marble text-center mb-6 animate-fade-in">
                    <div className="text-sm text-[#9A9A9A]">Puntos Arcade</div>
                    <div className="text-3xl font-bold text-[#5B7A5E] my-1" style={{ fontFamily: "'Playfair Display', serif" }}>0</div>
                    <div className="text-xs text-[#9A9A9A]">Juega y sube en el ranking</div>
                </div>

                <div className="space-y-3 stagger">
                    {games.map((g, i) => (
                        <Link key={g.id} href={`/app/arcade/${g.id}`} className="card flex items-center gap-4 group animate-fade-in">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${g.color}15` }}>
                                {g.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold">{g.name}</div>
                                <div className="text-xs text-[#9A9A9A] truncate">{g.desc}</div>
                            </div>
                            <span className="text-[#9A9A9A] group-hover:text-[#5B7A5E] transition-colors text-lg">→</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
