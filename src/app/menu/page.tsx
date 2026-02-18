// ═══ MENU PAGE — Mediterranean Stitch Redesign ═══
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
        <div className="min-h-screen azulejo-pattern pb-24" style={{ background: '#FDFBF7' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#C3703C]/10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#C3703C]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#171412]">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-extrabold tracking-tight">La Carta</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Category Filter Pills */}
            <nav className="sticky top-[65px] z-40 bg-white/80 backdrop-blur-md border-b border-[#C3703C]/5">
                <div className="max-w-5xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
                    {categories.map((cat, i) => (
                        <a key={cat.id} href={`#cat-${cat.name}`}
                            className={`shrink-0 text-sm font-bold px-4 py-2 rounded-full border transition-all hover:shadow-sm ${i === 0
                                ? 'bg-[#C3703C] text-white border-[#C3703C]'
                                : 'bg-white text-[#827268] border-[#C3703C]/10 hover:border-[#C3703C]/30 hover:text-[#C3703C]'
                                }`}>
                            {cat.icon} {cat.name}
                        </a>
                    ))}
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {grouped.map(cat => (
                    <section key={cat.id} id={`cat-${cat.name}`} className="mb-12">
                        <h2 className="text-2xl font-extrabold mb-5 flex items-center gap-3">
                            <span className="text-3xl">{cat.icon}</span> {cat.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
                            {cat.items.map((item, i) => (
                                <div key={item.id} className="card flex gap-4 animate-fade-in !border-[#C3703C]/5" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-base">{item.name}</h3>
                                            {item.badge && (
                                                <span className="text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 uppercase tracking-wider">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#827268] mb-3 leading-relaxed">{item.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-extrabold text-[#C3703C]">{item.price.toFixed(2)}€</span>
                                            <div className="flex items-center gap-1 text-xs text-[#D4AF37] font-bold">
                                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                +{Math.round(item.price * 10)} XP
                                            </div>
                                        </div>
                                        {item.allergens && (
                                            <div className="mt-2 text-xs text-[#a09187] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">health_and_safety</span>
                                                {item.allergens}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Floating Cart CTA */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <Link href="/login" className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-[#C3703C] to-[#D4AF37] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined">login</span>
                    Entrar para Pedir
                </Link>
            </div>
        </div>
    )
}
