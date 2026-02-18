"use client"
import Link from 'next/link'

type OrderSummary = {
    id: string
    code: string
    user: { name: string, avatar: string }
    total: number
    status: string
    createdAt: Date
    itemsCount: number
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PREPARING: "Cocinando",
    READY: "Listo",
    DELIVERING: "Reparto",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-500",
    CONFIRMED: "bg-blue-500/10 text-blue-500",
    PREPARING: "bg-orange-500/10 text-orange-500",
    READY: "bg-purple-500/10 text-purple-500",
    DELIVERING: "bg-indigo-500/10 text-indigo-500",
    DELIVERED: "bg-green-500/10 text-green-500",
    CANCELLED: "bg-red-500/10 text-red-500",
}

export function RecentOrders({ orders }: { orders: OrderSummary[] }) {
    return (
        <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 h-96 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">list_alt</span>
                    Últimos Pedidos
                </h3>
                <Link href="/admin/orders" className="text-xs text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wider">
                    Ver todos
                </Link>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                {orders.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                        No hay pedidos recientes
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                                        {order.user.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-white font-bold text-sm">#{order.code || order.id.slice(-4)}</span>
                                            <span className="text-slate-400 text-xs">· {order.itemsCount} items</span>
                                        </div>
                                        <p className="text-slate-500 text-xs">{order.user.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-sm">{order.total.toFixed(2)}€</p>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.PENDING}`}>
                                        {STATUS_LABELS[order.status] || order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
