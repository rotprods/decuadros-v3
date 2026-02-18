"use client"
import { updateOrderStatus } from "@/app/actions/admin"
import { useState, useTransition } from "react"

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pendiente", color: "bg-yellow-500/20 text-yellow-300" },
    { value: "CONFIRMED", label: "Confirmado", color: "bg-blue-500/20 text-blue-300" },
    { value: "PREPARING", label: "En Cocina", color: "bg-orange-500/20 text-orange-300" },
    { value: "READY", label: "Listo", color: "bg-purple-500/20 text-purple-300" },
    { value: "DELIVERING", label: "En Reparto", color: "bg-indigo-500/20 text-indigo-300" },
    { value: "DELIVERED", label: "Entregado", color: "bg-green-500/20 text-green-300" },
    { value: "CANCELLED", label: "Cancelado", color: "bg-red-500/20 text-red-300" },
]

export function OrderList({ orders }: { orders: any[] }) {
    return (
        <div className="space-y-4">
            {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-white/5">
                    <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                    <p>No hay pedidos activos.</p>
                </div>
            ) : (
                orders.map((order) => (
                    <OrderItem key={order.id} order={order} />
                ))
            )}
        </div>
    )
}

function OrderItem({ order }: { order: any }) {
    const [isPending, startTransition] = useTransition()

    const handleStatusChange = (newStatus: string) => {
        startTransition(async () => {
            await updateOrderStatus(order.id, newStatus)
        })
    }

    const currentStatus = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0]

    return (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:border-amber-500/30 transition-colors">

            {/* Order Info */}
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-amber-500 font-mono font-bold text-lg">#{order.code || order.id.slice(-4)}</span>
                    <span className="text-slate-400 text-sm">{new Date(order.createdAt).toLocaleString()}</span>
                    {order.delivery && <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">moped</span> Delivery</span>}
                </div>

                <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-lg">{order.user.avatar}</div>
                    <div>
                        <p className="text-white font-medium text-sm">{order.user.name}</p>
                        <p className="text-slate-500 text-xs">{order.user.phone || 'Sin teléfono'}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="text-slate-300 text-sm flex gap-2">
                            <span className="text-amber-500 font-bold">{item.quantity}x</span>
                            <span>{item.menuItem.name}</span>
                            <span className="text-slate-600">({item.price.toFixed(2)}€)</span>
                        </div>
                    ))}
                </div>
                {order.notes && (
                    <div className="mt-3 bg-red-500/10 text-red-300 text-xs p-2 rounded-lg border border-red-500/20">
                        ⚠️ Nota: {order.notes}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-4 min-w-[200px]">
                <div className="text-right">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total</p>
                    <p className="text-2xl font-bold text-white">{order.total.toFixed(2)}€</p>
                </div>

                <div className="relative">
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isPending}
                        className={`appearance-none pl-4 pr-10 py-2 rounded-xl text-sm font-bold cursor-pointer outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${currentStatus.color} ${isPending ? 'opacity-50' : ''}`}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">{opt.label}</option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-current pointer-events-none text-sm">expand_more</span>
                </div>
            </div>
        </div>
    )
}
