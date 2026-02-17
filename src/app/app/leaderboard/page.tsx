// ═══ LEADERBOARD — Mediterranean + Full API ═══
import { db } from '@/lib/db'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getData() {
    return db.user.findMany({ orderBy: { totalXP: 'desc' }, take: 20, select: { id: true, name: true, avatar: true, totalXP: true, tier: true, streak: true } })
}

export default async function LeaderboardPage() {
    const users = await getData()
    const podium = users.slice(0, 3)
    const rest = users.slice(3)

    return (
        <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
                <div className="max-w-lg mx-auto px-5 py-3 flex items-center gap-3">
                    <Link href="/app" className="text-[#9A9A9A] hover:text-[#5B7A5E]">←</Link>
                    <h1 className="font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>🏆 Ranking</h1>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-5 py-6">
                {podium.length >= 3 && (
                    <div className="flex items-end justify-center gap-3 mb-8 animate-slide-up">
                        {[podium[1], podium[0], podium[2]].map((u, i) => {
                            const heights = [100, 130, 80]
                            const medals = ['🥈', '🥇', '🥉']
                            return (
                                <div key={u.id} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <div className="text-3xl mb-2">{medals[i]}</div>
                                    <div className="text-2xl mb-1">{u.avatar || '😎'}</div>
                                    <div className="text-xs font-bold mb-2 truncate max-w-[80px]">{u.name || 'Anónimo'}</div>
                                    <div className="rounded-t-xl mx-auto w-20 flex items-end justify-center" style={{ height: heights[i], background: i === 1 ? 'linear-gradient(180deg, #C5A55A, #D4BA7A)' : '#F3F0EA' }}>
                                        <span className="text-sm font-bold pb-2" style={{ color: i === 1 ? 'white' : '#5B7A5E' }}>{u.totalXP}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="space-y-2 stagger">
                    {rest.map((u, i) => (
                        <div key={u.id} className="card !p-3 flex items-center gap-3 animate-fade-in">
                            <span className="w-7 text-center text-sm font-bold text-[#9A9A9A]">{i + 4}</span>
                            <div className="text-xl">{u.avatar || '😎'}</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{u.name || 'Anónimo'}</div>
                                <div className="text-xs text-[#9A9A9A]">{u.tier} · 🔥 {u.streak}</div>
                            </div>
                            <span className="font-bold text-[#5B7A5E]">{u.totalXP} XP</span>
                        </div>
                    ))}
                </div>

                {users.length === 0 && (
                    <div className="card-marble text-center">
                        <div className="text-5xl mb-3">🏆</div>
                        <h3 className="font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>¡Sé el primero!</h3>
                        <p className="text-sm text-[#9A9A9A]">Acumula XP para aparecer aquí</p>
                    </div>
                )}
            </div>
        </div>
    )
}
