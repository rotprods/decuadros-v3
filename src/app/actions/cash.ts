"use server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function openCashSession(locationId: string, startAmount: number) {
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
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const cashSession = await db.cashSession.findUnique({ where: { id: sessionId } })
        if (!cashSession) return { success: false, error: "Sesión no encontrada" }

        // TODO: Validate logic for Expected Cash (Start + Cash Sales - Withdrawals)
        // For now, we store what was counted.

        const discrepancy = endAmount - cashSession.startAmount

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
