"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        await db.order.update({
            where: { id: orderId },
            data: { status }
        })
        revalidatePath("/admin/orders")
        revalidatePath("/admin") // Refresh stats too
        return { success: true }
    } catch (error) {
        console.error("Failed to update order:", error)
        return { success: false, error: "Failed to update" }
    }
}

export async function updateMenuItemStatus(itemId: string, active: boolean) {
    try {
        await db.menuItem.update({
            where: { id: itemId },
            data: { active }
        })
        revalidatePath("/admin/menu")
        revalidatePath("/menu") // Update public menu too
        return { success: true }
    } catch (error) {
        console.error("Failed to update menu item:", error)
        return { success: false, error: "Failed to update" }
    }
}

export async function updateInventoryItem(id: string, data: { quantity?: number, cost?: number, minStock?: number }) {
    try {
        await db.inventoryItem.update({
            where: { id },
            data
        })
        revalidatePath("/admin/inventory")
        return { success: true }
    } catch (error) {
        console.error("Inventory Update Error:", error)
        return { success: false, error: "Failed to update inventory" }
    }
}

export async function addInventoryItem(locationId: string, data: { name: string, quantity: number, unit: string, cost: number, minStock: number }) {
    try {
        await db.inventoryItem.create({
            data: {
                locationId,
                ...data
            }
        })
        revalidatePath("/admin/inventory")
        return { success: true }
    } catch (error) {
        console.error("Inventory Create Error:", error)
        return { success: false, error: "Failed to create item" }
    }
}
