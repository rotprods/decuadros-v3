import { db } from "@/lib/db"
import { StatsCard } from "@/components/admin/StatsCard"
import { SalesChart } from "@/components/admin/SalesChart"
import { RecentOrders } from "@/components/admin/RecentOrders"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Parallel Data Fetching
    const [
        orderCount,
        userCount,
        revenue,
        activeOrders,
        recentOrdersWeek,
        recentOrdersList
    ] = await Promise.all([
        db.order.count({ where: { createdAt: { gte: today } } }),
        db.user.count(),
        db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: today } } }),
        db.order.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
        db.order.findMany({
            where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'CANCELLED' } },
            select: { createdAt: true, total: true }
        }),
        db.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, avatar: true } }, items: true }
        })
    ])

    const totalRevenue = revenue._sum.total || 0

    // Chart Data Processing
    const salesByDay = recentOrdersWeek.reduce((acc, order) => {
        const date = order.createdAt.toLocaleDateString('es-ES', { weekday: 'short' })
        const day = date.charAt(0).toUpperCase() + date.slice(1)
        acc[day] = (acc[day] || 0) + order.total
        return acc
    }, {} as Record<string, number>)

    const chartData = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' })
        const label = dayName.charAt(0).toUpperCase() + dayName.slice(1)
        chartData.push({ date: label, sales: salesByDay[label] || 0 })
    }

    // Recent Orders Formatting
    const formattedRecentOrders = recentOrdersList.map(o => ({
        id: o.id,
        code: o.code,
        user: o.user,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        itemsCount: o.items.reduce((s, i) => s + i.quantity, 0)
    }))

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Resumen del Despacho</h2>
                    <p className="text-slate-400">Bienvenido, Jefe. Aquí tienes el pulso de tu negocio.</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">El Jefe AI</div>
                    <div className="text-sm text-slate-300">Predicción: <span className="text-white font-bold">Alta Demanda (+15%)</span></div>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Ventas Hoy" value={`${totalRevenue.toFixed(2)}€`} icon="payments" trend="+12% vs ayer" />
                <StatsCard title="Pedidos Hoy" value={orderCount.toString()} icon="receipt_long" trend="+5% vs ayer" />
                <StatsCard title="Pedidos Activos" value={activeOrders.toString()} icon="cooking" trend="En cocina/reparto" trendUp={activeOrders > 0} />
                <StatsCard title="Usuarios Totales" value={userCount.toString()} icon="group" trend="+24 nuevo mes" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <SalesChart data={chartData} />
                <RecentOrders orders={formattedRecentOrders} />
            </div>
        </div>
    )
}
