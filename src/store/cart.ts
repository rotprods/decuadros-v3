import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image: string
    customizations?: string[]
}

interface CartState {
    items: CartItem[]
    isOpen: boolean
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, delta: number) => void
    clearCart: () => void
    toggleCart: () => void
    total: () => number
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (item) => set((state) => {
                const existing = state.items.find((i) => i.id === item.id)
                if (existing) {
                    return {
                        items: state.items.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                        isOpen: true
                    }
                }
                return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true }
            }),
            removeItem: (id) => set((state) => ({
                items: state.items.filter((i) => i.id !== id)
            })),
            updateQuantity: (id, delta) => set((state) => {
                const items = state.items.map((i) => {
                    if (i.id === id) {
                        return { ...i, quantity: Math.max(0, i.quantity + delta) }
                    }
                    return i
                }).filter((i) => i.quantity > 0)
                return { items }
            }),
            clearCart: () => set({ items: [] }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            total: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0)
        }),
        {
            name: 'decuadros-cart',
        }
    )
)
