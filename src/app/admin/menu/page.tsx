import { db } from "@/lib/db"
import { MenuManager } from "@/components/admin/MenuManager"

export const dynamic = 'force-dynamic'

export default async function AdminMenuPage() {
    const categories = await db.category.findMany({
        include: {
            items: {
                orderBy: { name: 'asc' }
            }
        },
        orderBy: { sortOrder: 'asc' }
    })

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white m-0">Carta Digital</h2>
                    <p className="text-slate-400">Activa o desactiva platos ("Agotado") con un clic.</p>
                </div>
            </header>

            <MenuManager categories={categories} />
        </div>
    )
}
