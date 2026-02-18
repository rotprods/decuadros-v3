// ═══ MENU PAGE — Mediterranean Stitch Redesign ═══
import { db } from '@/lib/db'
import Link from 'next/link'
import MenuClient from './MenuClient'

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

    return (
        <div className="min-h-screen" style={{ background: '#FDFBF7' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#C3703C]/10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#C3703C]/10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-[#171412]">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-extrabold tracking-tight text-[#171412]">La Carta</h1>
                    <div className="w-10" />
                </div>
            </header>

            <MenuClient items={items} categories={categories} />
        </div>
    )
}
