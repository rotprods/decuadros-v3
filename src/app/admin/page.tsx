import { db } from "@/lib/db"
import { StatsCard } from "@/components/admin/StatsCard"

export const dynamic = 'force-dynamic' // Ensure real-time data

export default async function AdminDashboard() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch real data from DB
    const [orderCount, userCount, revenue, activeOrders] = await Promise.all([
        db.order.count({ where: { createdAt: { gte: today } } }),
        db.user.count(),
        db.order.aggregate({
            _sum: { total: true },
            where: { createdAt: { gte: today } }
        }),
        db.order.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } })
    ])

    const totalRevenue = revenue._sum.total || 0

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Resumen del Despacho</h2>
                <p className="text-slate-400">Bienvenido, Jefe. Aquí tienes el pulso de tu negocio.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Ventas Hoy"
                    value={`${totalRevenue.toFixed(2)}€`}
                    icon="payments"
                    trend="+12% vs ayer"
                />
                <StatsCard
                    title="Pedidos Hoy"
                    value={orderCount.toString()}
                    icon="receipt_long"
                    trend="+5% vs ayer"
                />
                <StatsCard
                    title="Pedidos Activos"
                    value={activeOrders.toString()}
                    icon="cooking"
                    trend="En cocina/reparto"
                    trendUp={activeOrders > 0}
                />
                <StatsCard
                    title="Usuarios Totales"
                    value={userCount.toString()}
                    icon="group"
                    trend="+24 nuevo mes"
                />
            </div>

            {/* We will add charts and recent orders table here next */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 h-96 flex items-center justify-center text-slate-500">
                    Gráfico de Ventas (Próximamente)
                </div>
                <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 h-96 flex items-center justify-center text-slate-500">
                    Últimos Pedidos (Próximamente)
                </div>
            </div>
        </div>
    )
}
