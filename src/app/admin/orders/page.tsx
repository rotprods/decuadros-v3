import { db } from "@/lib/db"
import { OrderList } from "@/components/admin/OrderList"

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
    const orders = await db.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            items: {
                include: { menuItem: true }
            }
        },
        take: 50 // Limit for now
    })

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Gestión de Pedidos</h2>
                    <p className="text-slate-400">Control de cocina y reparto en tiempo real.</p>
                </div>
                <div className="bg-slate-900 px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-slate-400">
                    {orders.length} pedidos recientes
                </div>
            </header>

            <OrderList orders={orders} />
        </div>
    )
}
