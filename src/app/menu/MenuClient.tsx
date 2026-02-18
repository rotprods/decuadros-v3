'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/store/cart'
import Link from 'next/link'
import Image from 'next/image'

export default function MenuClient({ items, categories }: { items: any[], categories: any[] }) {
    const { addItem, items: cartItems, total } = useCart()
    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || '')
    const grouped = categories.map(cat => ({ ...cat, items: items.filter(i => i.categoryId === cat.id) }))

    const getItemQuantity = (id: string) => cartItems.find(i => i.id === id)?.quantity || 0

    return (
        <div className="min-h-screen azulejo-pattern pb-32" style={{ background: '#FDFBF7' }}>
            {/* Category Filter Pills */}
            <nav className="sticky top-[65px] z-40 bg-white/80 backdrop-blur-md border-b border-[#C3703C]/5 no-scrollbar overflow-x-auto">
                <div className="max-w-5xl mx-auto px-6 py-3 flex gap-2">
                    {categories.map((cat, i) => (
                        <button key={cat.id} onClick={() => {
                            document.getElementById(`cat-${cat.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            setSelectedCategory(cat.name)
                        }}
                            className={`shrink-0 text-sm font-bold px-4 py-2 rounded-full border transition-all ${selectedCategory === cat.name
                                    ? 'bg-[#C3703C] text-white border-[#C3703C] shadow-md'
                                    : 'bg-white text-[#827268] border-[#C3703C]/10 hover:border-[#C3703C]/30'
                                }`}>
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {grouped.map(cat => (
                    <section key={cat.id} id={`cat-${cat.name}`} className="mb-12 scroll-mt-32">
                        <h2 className="text-2xl font-extrabold mb-5 flex items-center gap-3 text-[#171412]">
                            <span className="text-3xl filter drop-shadow-sm">{cat.icon}</span> {cat.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cat.items.map((item: any, i: number) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    key={item.id}
                                    className="relative bg-white rounded-2xl p-4 shadow-sm border border-[#C3703C]/5 hover:shadow-md transition-all flex gap-4"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-base text-[#171412]">{item.name}</h3>
                                            {item.badge && (
                                                <span className="text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#827268] mb-3 leading-relaxed line-clamp-2">{item.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-lg font-extrabold text-[#C3703C]">{item.price.toFixed(2)}€</span>

                                            {getItemQuantity(item.id) > 0 ? (
                                                <div className="flex items-center gap-3 bg-[#F4F2F1] rounded-full px-1 py-1">
                                                    <button onClick={() => addItem({ ...item, quantity: -1 } as any)} className="w-7 h-7 rounded-full bg-white text-[#C3703C] shadow-sm flex items-center justify-center font-bold disabled:opacity-50">-</button>
                                                    <span className="font-bold text-sm min-w-[12px] text-center">{getItemQuantity(item.id)}</span>
                                                    <button onClick={() => addItem(item)} className="w-7 h-7 rounded-full bg-[#C3703C] text-white shadow-sm flex items-center justify-center font-bold">+</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => addItem(item)}
                                                    className="w-8 h-8 rounded-full bg-[#C3703C]/10 text-[#C3703C] flex items-center justify-center hover:bg-[#C3703C] hover:text-white transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Floating Cart Bar */}
            <AnimatePresence>
                {cartItems.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-6 left-6 right-6 z-50 max-w-lg mx-auto"
                    >
                        <Link href="/app/cart" className="flex items-center justify-between bg-[#171412] text-white p-4 rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#C3703C] flex items-center justify-center font-bold">
                                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Total</span>
                                    <span className="font-bold text-lg">{total().toFixed(2)}€</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pr-2">
                                <span className="font-bold text-sm">Ver Pedido</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
