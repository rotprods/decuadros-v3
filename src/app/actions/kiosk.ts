"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Public action for Kiosk (no auth required, but maybe rate limited or validated by table existence)
export async function createKioskOrder(data: {
    tableId: string
    items: { menuItemId: string; quantity: number }[]
}) {
    try {
        // Generate a public order code (e.g., K-123)
        // We need a user to attach to. Ideally "Guest" or "Table X".
        // For MVP, checking if a "Guest" user exists or creating one.
        // OR, the schema requires userId. We should probably have a system user for Kiosks.

        let guestUser = await db.user.findFirst({ where: { email: "guest@decuadros.com" } })
        if (!guestUser) {
            guestUser = await db.user.create({
                data: {
                    email: "guest@decuadros.com",
                    name: "Kiosk Guest",
                    role: "USER"
                }
            })
        }

        // Calculate total
        const menuItems = await db.menuItem.findMany({
            where: { id: { in: data.items.map(i => i.menuItemId) } }
        })

        let total = 0
        const orderItemsData = data.items.map(item => {
            const product = menuItems.find(p => p.id === item.menuItemId)
            if (!product) throw new Error("Producto no encontrado")
            total += product.price * item.quantity
            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: product.price
            }
        })

        // Generate code
        const count = await db.order.count()
        const code = `K-${(count + 1).toString().padStart(4, '0')}`

        const order = await db.order.create({
            data: {
                code,
                userId: guestUser.id,
                status: "PENDING",
                total,
                subtotal: total,
                delivery: false,
                notes: `Mesa ${data.tableId}`,
                items: {
                    create: orderItemsData
                }
            }
        })

        revalidatePath("/admin/kds")
        revalidatePath("/admin/orders")

        return { success: true, orderId: order.id, code }
    } catch (error) {
        console.error("Kiosk Error:", error)
        return { success: false, error: "Error al crear pedido" }
    }
}
