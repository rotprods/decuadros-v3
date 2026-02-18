"use server"

import { prisma } from "@/lib/prisma"
import { enforcePermission } from "@/lib/rbac"
import { revalidatePath } from "next/cache"

export async function getSystemSettings() {
    await enforcePermission("SETTINGS", "read") // Assume we add SETTINGS permission or use OWNER
    const settings = await prisma.systemSetting.findMany()
    return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
}

export async function updateSystemSetting(key: string, value: string, description?: string, category: string = "GENERAL") {
    await enforcePermission("SETTINGS", "update")

    await prisma.systemSetting.upsert({
        where: { key },
        update: { value, description, category },
        create: { key, value, description, category }
    })

    revalidatePath("/admin/settings")
    return { success: true }
}

export async function initializeDefaultSettings() {
    const defaults = [
        { key: "site_name", value: "De Cuadros", category: "GENERAL", description: "Nombre del restaurante" },
        { key: "ai_enabled", value: "true", category: "AI", description: "Activar Inteligencia Artificial" },
        { key: "marketing_auto", value: "true", category: "MARKETING", description: "Enviar campañas automáticas" },
        { key: "stock_safety_margin", value: "10", category: "OPERATIONS", description: "% Stock de seguridad" },
        { key: "welcome_message", value: "¡Bienvenido a De Cuadros!", category: "GENERAL", description: "Mensaje en Home" },
    ]

    for (const s of defaults) {
        const exists = await prisma.systemSetting.findUnique({ where: { key: s.key } })
        if (!exists) {
            await prisma.systemSetting.create({ data: s })
        }
    }
}
