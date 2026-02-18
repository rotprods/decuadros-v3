"use server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

import { enforcePermission } from "@/lib/rbac"

export async function openCashSession(locationId: string, startAmount: number) {
    await enforcePermission('CASH', 'MANAGE')
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const existing = await db.cashSession.findFirst({
            where: { locationId, endTime: null }
        })
        if (existing) return { success: false, error: "Ya hay una caja abierta en esta ubicación." }

        await db.cashSession.create({
            data: {
                locationId,
                startAmount,
                openedBy: session.user.id
            }
        })
        revalidatePath("/admin/cash")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: "Error al abrir caja." }
    }
}

export async function closeCashSession(sessionId: string, endAmount: number, notes?: string) {
    await enforcePermission('CASH', 'MANAGE')
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const cashSession = await db.cashSession.findUnique({ where: { id: sessionId } })
        if (!cashSession) return { success: false, error: "Sesión no encontrada" }


        // Calculate Expected Cash: Start Amount + Cash Sales
        const cashOrders = await db.order.findMany({
            where: {
                locationId: cashSession.locationId,
                paymentMethod: "CASH",
                createdAt: {
                    gte: cashSession.startTime,
                    lte: new Date()
                }
            }
        })

        const cashSales = cashOrders.reduce((sum, order) => sum + order.total, 0)
        const expectedCash = cashSession.startAmount + cashSales
        const discrepancy = endAmount - expectedCash

        await db.cashSession.update({
            where: { id: sessionId },
            data: {
                endTime: new Date(),
                endAmount,
                discrepancy,
                notes,
                closedBy: session.user.id
            }
        })
        revalidatePath("/admin/cash")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: "Error al cerrar caja." }
    }
}
