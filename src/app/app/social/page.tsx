// ═══ SOCIAL — Mediterranean + Full API ═══
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SocialPage() {
    const [tab, setTab] = useState<'feed' | 'reviews' | 'ranking'>('feed')
    const [posts, setPosts] = useState<any[]>([])
    const [reviews, setReviews] = useState<any>({ reviews: [], stats: { average: 0, total: 0, distribution: [] } })
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/social?type=feed').then(r => r.json()).then(d => { setPosts(d.posts || []); setLoading(false) }).catch(() => setLoading(false))
        fetch('/api/social?type=reviews').then(r => r.json()).then(d => setReviews(d)).catch(() => { })
        fetch('/api/social?type=leaderboard').then(r => r.json()).then(d => setLeaderboard(d.leaderboard || [])).catch(() => { })
    }, [])

    const likePost = async (postId: string) => {
        await fetch('/api/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'like', postId }) })
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
                <div className="max-w-lg mx-auto px-5 py-3 flex items-center gap-3">
                    <Link href="/app" className="text-[#9A9A9A] hover:text-[#5B7A5E]">←</Link>
                    <h1 className="font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>📸 Social</h1>
                </div>
                <div className="max-w-lg mx-auto flex">
                    {[
                        { id: 'feed' as const, label: '📸 Feed' },
                        { id: 'reviews' as const, label: '⭐ Reseñas' },
                        { id: 'ranking' as const, label: '🏆 Ranking' },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'text-[#5B7A5E] border-[#5B7A5E]' : 'text-[#9A9A9A] border-transparent'}`}>{t.label}</button>
                    ))}
                </div>
            </header>

            <div className="max-w-lg mx-auto px-5 py-6">
                {tab === 'feed' && (
                    <div className="space-y-4">
                        {loading ? <div className="text-center text-[#9A9A9A] py-8">Cargando...</div> : posts.length === 0 ? (
                            <div className="card-marble text-center">
                                <div className="text-5xl mb-3">📸</div>
                                <h3 className="font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>¡Comparte tu experiencia!</h3>
                                <p className="text-sm text-[#9A9A9A] mb-4">Sé el primero en subir una foto de tu plato</p>
                            </div>
                        ) : posts.map((p, i) => (
                            <div key={p.id} className="card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-2xl">{p.user?.avatar || '😎'}</div>
                                    <div><div className="font-semibold text-sm">{p.user?.name || 'Anónimo'}</div><div className="text-xs text-[#9A9A9A]">{new Date(p.createdAt).toLocaleDateString('es-ES')}</div></div>
                                    {p.user?.tier && <span className="tier-badge ml-auto text-[8px]">{p.user.tier}</span>}
                                </div>
                                {p.caption && <p className="text-sm text-[#6B6B6B] mb-3">{p.caption}</p>}
                                <div className="flex gap-4 text-sm text-[#9A9A9A]">
                                    <button onClick={() => likePost(p.id)} className="hover:text-red-400 transition-colors">❤️ {p.likes}</button>
                                    <span>💬 {p.comments}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'reviews' && (
                    <div className="space-y-4">
                        <div className="card-marble text-center animate-fade-in">
                            <div className="text-5xl mb-2">⭐</div>
                            <h3 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{reviews.stats?.average || '—'} / 5</h3>
                            <div className="text-2xl my-2">{'⭐'.repeat(Math.round(reviews.stats?.average || 0))}</div>
                            <p className="text-sm text-[#9A9A9A]">{reviews.stats?.total || 0} reseñas verificadas</p>
                            {reviews.stats?.distribution?.length > 0 && (
                                <div className="mt-4 space-y-1">
                                    {reviews.stats.distribution.map((d: any) => (
                                        <div key={d.rating} className="flex items-center gap-2 text-xs">
                                            <span className="w-3">{d.rating}★</span>
                                            <div className="flex-1 h-2 bg-[#F3F0EA] rounded-full overflow-hidden"><div className="h-full bg-[#C5A55A] rounded-full" style={{ width: `${reviews.stats.total ? (d.count / reviews.stats.total) * 100 : 0}%` }}></div></div>
                                            <span className="text-[#9A9A9A] w-6 text-right">{d.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {(reviews.reviews || []).map((r: any, i: number) => (
                            <div key={r.id || i} className="card animate-fade-in">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{r.user?.avatar || '😎'}</span>
                                    <span className="font-medium text-sm">{r.user?.name || 'Anónimo'}</span>
                                    <span className="ml-auto text-sm">{'⭐'.repeat(r.rating)}</span>
                                </div>
                                {r.text && <p className="text-sm text-[#6B6B6B]">{r.text}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'ranking' && (
                    <div className="space-y-2 stagger">
                        {leaderboard.length === 0 ? (
                            <div className="card-marble text-center"><div className="text-5xl mb-3">🏆</div><p className="text-sm text-[#9A9A9A]">Acumula XP para aparecer aquí</p></div>
                        ) : leaderboard.slice(0, 10).map((u: any) => (
                            <div key={u.id} className="card !p-3 flex items-center gap-3 animate-fade-in">
                                <span className="w-7 text-center font-bold text-sm" style={{ color: u.rank <= 3 ? '#C5A55A' : '#9A9A9A' }}>{u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : `#${u.rank}`}</span>
                                <span className="text-xl">{u.avatar || '😎'}</span>
                                <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{u.name}</div><div className="text-xs text-[#9A9A9A]">{u.tier} · 🔥{u.streak}</div></div>
                                <span className="font-bold text-[#5B7A5E]">{u.totalXP} XP</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
