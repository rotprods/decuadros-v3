"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { createKioskOrder } from "@/app/actions/kiosk"

// Simplified types
type KioskItem = {
    id: string
    name: string
    price: number
    image: string
    category: string
}

export default function KioskPage() {
    const params = useParams()
    const tableId = params.id as string
    const router = useRouter()

    // In real app, fetch menu from API
    // We'll mock for MVP or fetch client side
    const [menu, setMenu] = useState<KioskItem[]>([])
    const [cart, setCart] = useState<{ item: KioskItem, quantity: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/menu")
            .then(res => res.json())
            .then(data => {
                // Flatten categories to items for simple kiosk view
                const allItems = data.flatMap((cat: any) => cat.items.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    category: cat.name
                })))
                setMenu(allItems)
                setLoading(false)
            })
    }, [])

    const addToCart = (item: KioskItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.item.id === item.id)
            if (existing) {
                return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { item, quantity: 1 }]
        })
    }

    const total = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0)

    const handlePlaceOrder = async () => {
        if (!confirm(`¿Confirmar pedido por ${total.toFixed(2)}€?`)) return

        setLoading(true)
        const res = await createKioskOrder({
            tableId: tableId,
            items: cart.map(c => ({ menuItemId: c.item.id, quantity: c.quantity }))
        })
        setLoading(false)

        if (res.success) {
            alert(`¡Pedido ${res.code} enviado a cocina! 👨‍🍳`)
            setCart([])
        } else {
            alert("Error al enviar pedido: " + res.error)
        }
    }

    if (loading) return <div className="p-10 text-white">Cargando la carta...</div>

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-white">De Cuadros</h1>
                    <p className="text-xs text-amber-500 font-bold">MESA {tableId}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="text-xl font-black text-white">{total.toFixed(2)}€</p>
                </div>
            </header>

            {/* Menu Grid */}
            <div className="p-4 grid grid-cols-2 gap-4">
                {menu.map(item => (
                    <div key={item.id} onClick={() => addToCart(item)} className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden active:scale-95 transition-transform">
                        <div className="h-32 bg-slate-800 relative">
                            {/* Image placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center text-4xl">🍔</div>
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-white leading-tight">{item.name}</h3>
                            <p className="text-amber-500 font-bold mt-1">{item.price}€</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4">
                    <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-green-500 text-black font-black text-lg py-4 rounded-xl shadow-xl shadow-green-500/20 active:scale-95 transition-transform flex justify-between px-6"
                    >
                        <span>PEDIR ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                        <span>{total.toFixed(2)}€</span>
                    </button>
                </div>
            )}
        </div>
    )
}
