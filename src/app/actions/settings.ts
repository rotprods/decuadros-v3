"use server"

import { db } from "@/lib/db"
import { enforcePermission } from "@/lib/rbac"
import { revalidatePath } from "next/cache"

export async function getSystemSettings() {
    await enforcePermission("SETTINGS", "read") // Assume we add SETTINGS permission or use OWNER
    const settings = await db.systemSetting.findMany()
    return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
}

export async function updateSystemSetting(key: string, value: string, description?: string, category: string = "GENERAL") {
    await enforcePermission("SETTINGS", "update")

    await db.systemSetting.upsert({
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
        { key: "site_description", value: "Fusión Mediterránea", category: "GENERAL", description: "Descripción corta" },
        { key: "contact_phone", value: "+34 600 000 000", category: "GENERAL", description: "Teléfono WhatsApp" },

        { key: "ai_enabled", value: "true", category: "AI", description: "Activar Inteligencia Artificial" },
        { key: "marketing_auto", value: "true", category: "MARKETING", description: "Enviar campañas automáticas" },

        { key: "stock_safety_margin", value: "10", category: "OPERATIONS", description: "% Stock de seguridad" },
        { key: "store_hours", value: "L-D: 13:00-24:00", category: "OPERATIONS", description: "Horario visible" },

        { key: "service_delivery", value: "true", category: "SERVICES", description: "Delivery activo" },
        { key: "service_pickup", value: "true", category: "SERVICES", description: "Recogida activa" },
        { key: "delivery_min_order", value: "15", category: "SERVICES", description: "Pedido mínimo" },
        { key: "delivery_fee", value: "2.50", category: "SERVICES", description: "Coste envío" },

        { key: "theme_color", value: "#f59e0b", category: "APPEARANCE", description: "Color primario" },
        { key: "welcome_message", value: "¡Bienvenido a De Cuadros!", category: "GENERAL", description: "Mensaje en Home" },
    ]

    for (const s of defaults) {
        const exists = await db.systemSetting.findUnique({ where: { key: s.key } })
        if (!exists) {
            await db.systemSetting.create({ data: s })
        }
    }
}
