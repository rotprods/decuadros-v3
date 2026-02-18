import { db } from "@/lib/db"
import { KitchenDisplay } from "@/components/admin/KitchenDisplay"

export const dynamic = 'force-dynamic'

export default async function AdminKDSPage() {
    // Fetch active orders (Pending or In Progress)
    const activeOrders = await db.order.findMany({
        where: {
            status: { in: ["PENDING", "IN_PROGRESS"] }
        },
        include: {
            items: {
                include: { menuItem: true }
            }
        },
        orderBy: { createdAt: 'asc' } // Oldest first
    })

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">KDS - Cocina</h2>
                    <p className="text-slate-400">Pantalla de pedidos activos.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-amber-500">
                            {activeOrders.filter(o => o.status === 'PENDING').length}
                        </span>
                        <span className="text-xs text-slate-400 uppercase">Pendientes</span>
                    </div>
                    <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-blue-500">
                            {activeOrders.filter(o => o.status === 'IN_PROGRESS').length}
                        </span>
                        <span className="text-xs text-slate-400 uppercase">En Marcha</span>
                    </div>
                </div>
            </header>

            <KitchenDisplay orders={activeOrders as any} />
        </div>
    )
}
