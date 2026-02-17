// ═══ ADMIN — Mediterranean ═══
import Link from 'next/link'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

async function getData() {
    const [users, items, missions, badges] = await Promise.all([
        db.user.count(),
        db.menuItem.count(),
        db.mission.count(),
        db.badge.count(),
    ])
    return { users, items, missions, badges }
}

export default async function AdminPage() {
    const d = await getData()
    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
                <div className="max-w-lg mx-auto px-5 py-3 flex items-center gap-3">
                    <Link href="/app" className="text-[#9A9A9A] hover:text-[#5B7A5E]">←</Link>
                    <h1 className="font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>⚙️ Admin</h1>
                </div>
            </header>
            <div className="max-w-lg mx-auto px-5 py-6">
                <div className="grid grid-cols-2 gap-3 stagger">
                    {[
                        { label: 'Usuarios', value: d.users, icon: '👥' },
                        { label: 'Platos', value: d.items, icon: '🍽️' },
                        { label: 'Misiones', value: d.missions, icon: '🎯' },
                        { label: 'Logros', value: d.badges, icon: '🏅' },
                    ].map((s, i) => (
                        <div key={i} className="card text-center animate-fade-in">
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <div className="text-2xl font-bold text-[#5B7A5E]" style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                            <div className="text-xs text-[#9A9A9A]">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
