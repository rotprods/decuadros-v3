// ═══ MENU PAGE — Mediterranean Premium ═══
import { db } from '@/lib/db'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

async function getMenu() {
    const [items, categories] = await Promise.all([
        db.menuItem.findMany({ where: { active: true }, include: { category: true }, orderBy: { category: { sortOrder: 'asc' } } }),
        db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    ])
    return { items, categories }
}

export default async function MenuPage() {
    const { items, categories } = await getMenu()
    const grouped = categories.map(cat => ({ ...cat, items: items.filter(i => i.categoryId === cat.id) }))

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-[#9A9A9A] hover:text-[#5B7A5E] text-sm">← Inicio</Link>
                    <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>🍽️ Carta</h1>
                    <div className="w-16" />
                </div>
            </header>

            <nav className="sticky top-[65px] z-40 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
                <div className="max-w-5xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
                    {categories.map(cat => (
                        <a key={cat.id} href={`#cat-${cat.name}`} className="shrink-0 text-sm font-medium px-4 py-2 rounded-full bg-white border border-[#EDE9E0] text-[#6B6B6B] hover:border-[#5B7A5E]/30 hover:text-[#5B7A5E] transition-colors">
                            {cat.icon} {cat.name}
                        </a>
                    ))}
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {grouped.map(cat => (
                    <section key={cat.id} id={`cat-${cat.name}`} className="mb-12">
                        <h2 className="text-2xl font-bold mb-5 flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                            <span className="text-3xl">{cat.icon}</span> {cat.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
                            {cat.items.map((item, i) => (
                                <div key={item.id} className="card flex gap-4 animate-fade-in">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-base">{item.name}</h3>
                                            {item.badge && (
                                                <span className="text-[10px] bg-[#C5A55A]/15 text-[#C5A55A] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 uppercase tracking-wider">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#9A9A9A] mb-3 leading-relaxed">{item.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-[#5B7A5E]">{item.price.toFixed(2)}€</span>
                                            <div className="flex gap-2 text-xs text-[#9A9A9A]">
                                                {item.nutrition && <span>{item.nutrition}</span>}
                                            </div>
                                        </div>
                                        {item.allergens && (
                                            <div className="mt-2 text-xs text-[#9A9A9A]">⚕️ {item.allergens}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <Link href="/login" className="btn-olive shadow-lg flex items-center gap-2">🌿 Entrar para Pedir</Link>
            </div>
        </div>
    )
}
