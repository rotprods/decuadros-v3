"use client"
import { useEffect, useState, useCallback } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { updateOrderStatus } from "@/app/actions/admin"

type OrderItem = {
    quantity: number
    menuItem: { name: string }
}

type Order = {
    id: string
    createdAt: string
    status: string
    items: OrderItem[]
}

export function KitchenDisplay({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)

    const fetchOrders = useCallback(async () => {
        const res = await fetch("/api/admin/active-orders")
        if (res.ok) {
            const data = await res.json()
            setOrders(data)
        }
    }, [])

    useEffect(() => {
        // Subscribe to realtime changes on the orders table
        const channel = supabaseClient
            .channel("kds-orders")
            .on(
                "postgres_changes",
                {
                    event: "*", // INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    console.log("[KDS] Realtime event:", payload.eventType)
                    // Refetch active orders on any change
                    fetchOrders()
                }
            )
            .subscribe((status) => {
                console.log("[KDS] Realtime status:", status)
            })

        return () => {
            supabaseClient.removeChannel(channel)
        }
    }, [fetchOrders])

    const handleStatus = async (id: string, status: string) => {
        // Optimistic update — update UI immediately
        setOrders(prev =>
            status === "COMPLETED"
                ? prev.filter(o => o.id !== id)
                : prev.map(o => o.id === id ? { ...o, status } : o)
        )
        // Then persist to DB
        await updateOrderStatus(id, status)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map(order => (
                <div
                    key={order.id}
                    className={`bg-slate-900 border-2 rounded-xl p-4 flex flex-col justify-between min-h-[300px] transition-all duration-300 ${order.status === "PENDING"
                            ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            : "border-blue-500/30"
                        }`}
                >
                    <div>
                        <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-2">
                            <div>
                                <span className="text-3xl font-black text-white">#{order.id.slice(-4)}</span>
                                <p className="text-xs text-slate-400 font-mono mt-1">
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${order.status === "PENDING" ? "bg-amber-500 text-black" : "bg-blue-600 text-white"
                                }`}>
                                {order.status === "PENDING" ? "Pendiente" : "Cocinando"}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex gap-3 text-lg text-slate-200 border-b border-white/5 pb-1 last:border-0 items-start">
                                    <span className="font-bold text-amber-500 min-w-[30px]">{item.quantity}x</span>
                                    <span className="font-medium leading-tight">{item.menuItem.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
                        {order.status === "PENDING" && (
                            <button
                                onClick={() => handleStatus(order.id, "IN_PROGRESS")}
                                className="flex-1 bg-amber-500 text-black font-black py-4 rounded-xl hover:bg-amber-400 hover:scale-[1.02] transition-all uppercase tracking-wide"
                            >
                                👨‍🍳 COCINAR
                            </button>
                        )}
                        {order.status === "IN_PROGRESS" && (
                            <button
                                onClick={() => handleStatus(order.id, "COMPLETED")}
                                className="flex-1 bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-500 hover:scale-[1.02] transition-all uppercase tracking-wide"
                            >
                                ✅ SERVIR
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {orders.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-24 text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
                    <span className="text-6xl mb-4">🍽️</span>
                    <p className="text-2xl font-bold">Sin Comandas Pendientes</p>
                    <p className="text-sm mt-2">Las nuevas órdenes aparecerán aquí al instante</p>
                </div>
            )}
        </div>
    )
}
