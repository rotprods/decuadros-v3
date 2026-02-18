"use client"
import { useState, useTransition } from "react"
import { createPOSOrder } from "@/app/actions/pos"
import Image from "next/image"

type MenuItem = {
    id: string
    name: string
    price: number
    category: { name: string }
    image?: string | null
}

type CartItem = {
    menuItemId: string
    name: string
    price: number
    quantity: number
}

export function POSInterface({ menuItems, locationId }: { menuItems: MenuItem[], locationId: string }) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
    const [isPending, startTransition] = useTransition()

    // Derived state
    const categories = Array.from(new Set(menuItems.map(i => i.category.name)))
    const filteredItems = categoryFilter === "ALL"
        ? menuItems
        : menuItems.filter(i => i.category.name === categoryFilter)

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.menuItemId === item.id)
            if (existing) {
                return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }]
        })
    }

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.menuItemId !== itemId))
    }

    const adjustQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.menuItemId === itemId) {
                const newQty = i.quantity + delta
                return newQty > 0 ? { ...i, quantity: newQty } : i
            }
            return i
        }))
    }

    const handleCheckout = (method: string) => {
        if (cart.length === 0) return
        startTransition(async () => {
            const res = await createPOSOrder(locationId, cart, method, total)
            if (res.success) {
                setCart([])
                // Could show success toast
                alert("Pedido confirmado ✅")
            } else {
                alert("Error: " + res.error)
            }
        })
    }

    return (
        <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-100px)] gap-4">
            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
                    <button
                        onClick={() => setCategoryFilter("ALL")}
                        className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${categoryFilter === "ALL" ? "bg-white text-black" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                        TODO
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${categoryFilter === cat ? "bg-white text-black" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto content-start pr-2 pb-20 lg:pb-0">
                    {filteredItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="bg-slate-900 border border-white/5 p-4 rounded-xl flex flex-col gap-2 hover:border-amber-500 transition-colors text-left group h-auto"
                        >
                            <div className="w-full aspect-square bg-slate-950 rounded-lg mb-2 relative overflow-hidden">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 50vw, 25vw" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-600">
                                        <span className="material-symbols-outlined text-4xl">fastfood</span>
                                    </div>
                                )}
                            </div>
                            <span className="font-bold text-white leading-tight line-clamp-2">{item.name}</span>
                            <span className="text-amber-400 font-mono">{item.price.toFixed(2)}€</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: Cart (Fixed on mobile bottom, Sidebar on desktop) */}
            <div className="lg:w-96 bg-white shrink-0 rounded-2xl flex flex-col overflow-hidden text-black h-[50vh] lg:h-full border border-slate-200 shadow-xl lg:static fixed bottom-0 left-0 right-0 z-50">
                <div className="p-4 bg-slate-100 border-b border-slate-200">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        Ticket Actual
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
                            <p>Selecciona productos</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.menuItemId} className="flex justify-between items-center group border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{item.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{item.price.toFixed(2)}€ x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => adjustQuantity(item.menuItemId, -1)}
                                        className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
                                    >−</button>
                                    <span className="font-mono w-4 text-center font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => removeFromCart(item.menuItemId)}
                                        className="text-red-500 hover:text-red-700 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-slate-500 font-bold">Total</span>
                        <span className="text-3xl font-black font-mono">{total.toFixed(2)}€</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            disabled={isPending || cart.length === 0}
                            onClick={() => handleCheckout('CASH')}
                            className="bg-green-600 text-white py-4 rounded-xl font-bold flex flex-col items-center hover:bg-green-500 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined mb-1">payments</span>
                            EFECTIVO
                        </button>
                        <button
                            disabled={isPending || cart.length === 0}
                            onClick={() => handleCheckout('CARD')}
                            className="bg-blue-600 text-white py-4 rounded-xl font-bold flex flex-col items-center hover:bg-blue-500 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined mb-1">credit_card</span>
                            TARJETA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
