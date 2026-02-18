"use client"
import { useEffect, useState, useCallback } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { updateOrderStatus } from "@/app/actions/admin"

type OrderItem = {
    quantity: number
    menuItem: {
        name: string
        station: string
    }
    notes?: string
}

type Order = {
    id: string
    code: string
    createdAt: string
    status: string // PENDING, IN_PROGRESS, READY, DELIVERED, COMPLETED
    user: { name: string }
    items: OrderItem[]
}

const STATIONS = [
    { id: "ALL", name: "Todas las Estaciones" },
    { id: "KITCHEN", name: "Cocina" },
    { id: "BAR", name: "Barra" },
    { id: "PIZZA", name: "Horno Pizza" },
    { id: "DESSERT", name: "Postres" },
]

export function KitchenDisplay({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [selectedStation, setSelectedStation] = useState("ALL")

    const fetchOrders = useCallback(async () => {
        const res = await fetch("/api/admin/active-orders")
        if (res.ok) {
            const data = await res.json()
            setOrders(data)
        }
    }, [])

    useEffect(() => {
        const channel = supabaseClient
            .channel("kds-orders")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "Order",
                },
                (payload) => {
                    console.log("[KDS] Realtime event:", payload)
                    fetchOrders()
                }
            )
            .subscribe()

        return () => {
            supabaseClient.removeChannel(channel)
        }
    }, [fetchOrders])

    const handleStatus = async (id: string, status: string) => {
        setOrders(prev =>
            status === "COMPLETED"
                ? prev.filter(o => o.id !== id)
                : prev.map(o => o.id === id ? { ...o, status } : o)
        )
        await updateOrderStatus(id, status)
    }

    // Filter logic
    const filteredOrders = orders.filter(order => {
        if (selectedStation === "ALL") return true
        return order.items.some(item => item.menuItem.station === selectedStation)
    })

    return (
        <div className="space-y-6">
            {/* Station Selector Bar */}
            <div className="flex gap-2 bg-slate-900/50 p-2 rounded-xl overflow-x-auto">
                {STATIONS.map(station => (
                    <button
                        key={station.id}
                        onClick={() => setSelectedStation(station.id)}
                        className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${selectedStation === station.id
                                ? 'bg-amber-500 text-black'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {station.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOrders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-24 text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
                        <span className="text-6xl mb-4">🍽️</span>
                        <p className="text-2xl font-bold">
                            {selectedStation === 'ALL' ? "Sin Comandas Pendientes" : `Sin pedidos para ${selectedStation}`}
                        </p>
                        <p className="text-sm mt-2">Las nuevas órdenes aparecerán aquí al instante</p>
                    </div>
                )}

                {filteredOrders.map(order => (
                    <div
                        key={order.id}
                        className={`bg-slate-900 border-2 rounded-xl flex flex-col justify-between min-h-[300px] transition-all duration-300 overflow-hidden ${order.status === "PENDING"
                            ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            : "border-blue-500/30"
                            }`}
                    >
                        <div>
                            <div className={`p-4 flex justify-between items-start border-b border-white/10 ${order.status === 'PENDING' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                                }`}>
                                <div>
                                    <span className="text-3xl font-black text-white">#{order.code}</span>
                                    <p className="text-xs text-slate-400 font-mono mt-1">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-xs text-slate-500">{order.user.name}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${order.status === "PENDING" ? "bg-amber-500 text-black" :
                                        order.status === "READY" ? "bg-green-500 text-white" :
                                            "bg-blue-600 text-white"
                                    }`}>
                                    {order.status === "PENDING" ? "Pendiente" :
                                        order.status === "READY" ? "Listo" : "Marchando"}
                                </span>
                            </div>

                            <div className="p-4 space-y-3">
                                {order.items
                                    .filter(item => selectedStation === 'ALL' || item.menuItem.station === selectedStation)
                                    .map((item, i) => (
                                        <div key={i} className="flex gap-3 text-lg text-slate-200 border-b border-white/5 pb-1 last:border-0 items-start">
                                            <span className="font-bold text-amber-500 min-w-[30px]">{item.quantity}x</span>
                                            <div className="flex-1">
                                                <span className="font-medium leading-tight">{item.menuItem.name}</span>
                                                {item.notes && <p className="text-sm text-red-300 italic mt-0.5">Note: {item.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Coursing Controls */}
                        <div className="p-4 pt-0 mt-auto flex flex-col gap-2">
                            {order.status === "PENDING" && (
                                <button
                                    onClick={() => handleStatus(order.id, "IN_PROGRESS")}
                                    className="w-full bg-amber-500 text-black font-black py-4 rounded-xl hover:bg-amber-400 hover:scale-[1.02] transition-all uppercase tracking-wide shadow-lg shadow-amber-500/20"
                                >
                                    🔥 MARCHAR (FIRE)
                                </button>
                            )}
                            {order.status === "IN_PROGRESS" && (
                                <button
                                    onClick={() => handleStatus(order.id, "READY")}
                                    className="w-full bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-500 hover:scale-[1.02] transition-all uppercase tracking-wide shadow-lg shadow-green-500/20"
                                >
                                    ✅ LISTO PARA PASE
                                </button>
                            )}
                            {order.status === "READY" && (
                                <button
                                    onClick={() => handleStatus(order.id, "COMPLETED")}
                                    className="w-full bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all uppercase tracking-wide border border-white/10"
                                >
                                    🏁 ARCHIVAR (SERVIDO)
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
