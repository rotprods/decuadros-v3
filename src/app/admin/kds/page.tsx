import { db } from "@/lib/db"
import { KitchenDisplay } from "@/components/admin/KitchenDisplay"

export const dynamic = 'force-dynamic'

export default async function KDSPage() {
    // Initial fetch of active orders
    const initialOrders = await db.order.findMany({
        where: {
            status: { in: ["PENDING", "IN_PROGRESS"] }
        },
        include: {
            items: {
                include: { menuItem: true }
            }
        },
        orderBy: { createdAt: "asc" }
    })

    // Map to expected format if needed (Prisma dates are Date objects, component expects string for createdAt?)
    // KitchenDisplay expects: id, createdAt (string), status, items...
    // Prisma returns Date object. Serialization might handle it, but safer to map.

    const serializedOrders = initialOrders.map(o => ({
        ...o,
        createdAt: o.createdAt.toISOString()
    }))

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-amber-500">soup_kitchen</span>
                    Pantalla de Cocina (KDS)
                </h2>
                <p className="text-slate-400">Orden de llegada. Prioridad a las tarjetas ámbar.</p>
            </header>

            <KitchenDisplay initialOrders={serializedOrders as any} />
        </div>
    )
}
