import { db } from "@/lib/db"
import { InventoryList } from "@/components/admin/InventoryList"

export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage() {
    // Try to find a default location, or just take the first one
    const location = await db.location.findFirst()

    if (!location) {
        return (
            <div className="p-8 text-center text-slate-400">
                <h2 className="text-xl font-bold text-white mb-2">No Location Configured</h2>
                <p>Please run the seed script to create a default HQ location.</p>
                <code className="block mt-4 bg-slate-900 p-2 rounded text-xs">npx ts-node scripts/seed-quarters.ts</code>
            </div>
        )
    }

    const items = await db.inventoryItem.findMany({
        where: { locationId: location.id },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Inventario</h2>
                    <p className="text-slate-400">Gestión de stock en tiempo real para {location.name}.</p>
                </div>
                <div className="bg-slate-900 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-xs font-mono">
                    {items.length} referencias
                </div>
            </header>

            <InventoryList items={items} locationId={location.id} />
        </div>
    )
}
