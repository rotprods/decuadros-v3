"use server"
import { db } from "@/lib/db"

export async function deductStockForOrder(locationId: string, items: { menuItemId: string, quantity: number }[]) {
    try {
        // Process each order item
        for (const item of items) {
            // 1. Get ingredients for the menu item
            const menuItem = await db.menuItem.findUnique({
                where: { id: item.menuItemId },
                include: { ingredients: true }
            })

            if (!menuItem || !menuItem.ingredients.length) continue

            // 2. Deduct each ingredient from inventory at this location
            for (const ingredient of menuItem.ingredients) {
                // Find matching inventory item by name (loose coupling)
                // We use name matching because InventoryItems are per-location
                const inventoryItem = await db.inventoryItem.findFirst({
                    where: {
                        locationId: locationId,
                        name: ingredient.name // Case sensitive match 
                    }
                })

                if (inventoryItem) {
                    await db.inventoryItem.update({
                        where: { id: inventoryItem.id },
                        data: {
                            quantity: { decrement: ingredient.quantity * item.quantity }
                        }
                    })
                } else {
                    console.warn(`[Inventory] Warning: Ingredient '${ingredient.name}' not found in location '${locationId}'`)
                }
            }
        }
        return { success: true }
    } catch (error) {
        console.error("[Inventory] Failed to deduct stock:", error)
        // We don't throw here to avoid failing the order if inventory is messy
        // But in strict mode, we might want to throw
        return { success: false, error: "Inventory error" }
    }
}
