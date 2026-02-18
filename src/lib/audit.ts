import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function logAction(action: string, details: string, resourceId?: string) {
    try {
        const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
            console.warn("[Audit] Action performed without user ID:", action)
            // Still log if possible, or skip? Schema likely requires userId.
            // If system action, maybe we need a system user or nullable userId.
            // Let's check schema. If userId is required, we return.
            return
        }

        await db.auditLog.create({
            data: {
                userId,
                action,
                details: JSON.stringify({ message: details, resourceId })
            }
        })
    } catch (error) {
        console.error("[Audit] Failed to log action:", error)
        // Don't throw, logging shouldn't break the app
    }
}
