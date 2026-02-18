// ═══ CART PAGE — Mediterranean Stitch ═══
'use client'
import { useCart } from '@/store/cart'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function CartPage() {
    const { items, updateQuantity, removeItem, total, clearCart } = useCart()
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCheckout = async () => {
        setIsCheckingOut(true)
        setError(null)

        try {
            const stripeItems = items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image || undefined,
            }))

            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: stripeItems }),
            })

            const data = await res.json()

            if (!res.ok || !data.url) {
                throw new Error(data.error || "Error al crear el pago")
            }

            // Redirect to Stripe hosted checkout
            window.location.href = data.url
        } catch (err: any) {
            setError(err.message || "Error inesperado")
            setIsCheckingOut(false)
        }
    }


    if (items.length === 0) return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#C3703C]/10 flex items-center justify-center text-4xl mb-4 animate-bounce">
                🛒
            </div>
            <h1 className="text-xl font-bold mb-2">Tu cesta está vacía</h1>
            <p className="text-[#827268] mb-6">Añade algo delicioso de la carta.</p>
            <Link href="/menu" className="btn-olive">
                Ir a la Carta
            </Link>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-32">
            <header className="p-6 flex items-center gap-4 border-b border-[#C3703C]/10 sticky top-0 bg-[#FDFBF7]/80 backdrop-blur-md z-10">
                <Link href="/menu" className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#C3703C]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-xl font-extrabold">Tu Pedido</h1>
            </header>

            <div className="p-6 flex flex-col gap-4">
                <AnimatePresence>
                    {items.map((item) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={item.id}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-[#C3703C]/5 flex gap-4"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold">{item.name}</h3>
                                <div className="text-[#C3703C] font-bold text-sm mt-1">{(item.price * item.quantity).toFixed(2)}€</div>
                            </div>
                            <div className="flex items-center gap-3 bg-[#F4F2F1] rounded-full px-2 py-1 h-fit self-center">
                                <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, -1) : removeItem(item.id)} className="w-8 h-8 flex items-center justify-center font-bold text-[#827268] active:scale-90 transition-transform">-</button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold text-[#C3703C] active:scale-90 transition-transform">+</button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Summary */}
                <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-[#C3703C]/10">
                    <h3 className="font-bold mb-4 text-lg">Resumen</h3>
                    <div className="flex justify-between mb-2 text-sm text-[#827268]">
                        <span>Subtotal</span>
                        <span>{total().toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm text-[#827268]">
                        <span>IVA (10%)</span>
                        <span>{(total() * 0.1).toFixed(2)}€</span>
                    </div>
                    <div className="h-px bg-[#C3703C]/10 my-4" />
                    <div className="flex justify-between font-extrabold text-xl">
                        <span>Total</span>
                        <span className="text-[#C3703C]">{(total() * 1.1).toFixed(2)}€</span>
                    </div>
                </div>
            </div>

            {/* Checkout Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-[#C3703C]/10 z-20">
                {error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}
                <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-[#171412] text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isCheckingOut ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                            Redirigiendo a Stripe...
                        </>
                    ) : (
                        <>
                            <span>💳 Pagar {(total() * 1.1).toFixed(2)}€</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                    )}
                </button>
                <p className="text-center text-xs text-[#827268] mt-2">
                    Pago seguro con Stripe 🔒
                </p>
            </div>
        </div>
    )
}
