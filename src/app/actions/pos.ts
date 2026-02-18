"use server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createPOSOrder(locationId: string, items: { menuItemId: string, quantity: number, price: number, name: string }[], paymentMethod: string, total: number) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        // 1. Check for open cash session
        const cashSession = await db.cashSession.findFirst({
            where: { locationId, endTime: null }
        })
        if (!cashSession) return { success: false, error: "¡Caja CERRADA! Abre la caja primero." }

        // 2. Create Order
        const order = await db.order.create({
            data: {
                userId: session.user.id,
                status: "IN_PROGRESS",
                paymentStatus: "PAID",
                paymentMethod,
                total,
                locationId,
                items: {
                    create: items.map(item => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        })

        revalidatePath("/admin/orders")
        revalidatePath("/admin/pos")
        return { success: true, orderId: order.id }

    } catch (e) {
        console.error("POS Error:", e)
        return { success: false, error: "Error al crear pedido." }
    }
}
