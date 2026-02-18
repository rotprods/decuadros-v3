"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { enforcePermission } from "@/lib/rbac"
import { logAction } from "@/lib/audit"

export async function updateOrderStatus(orderId: string, status: string) {
    await enforcePermission('KDS', 'UPDATE')
    try {
        await db.order.update({
            where: { id: orderId },
            data: { status }
        })
        await logAction("UPDATE_ORDER_STATUS", `Order ${orderId} updated to ${status}`, orderId)
        revalidatePath("/admin/orders")
        revalidatePath("/admin") // Refresh stats too
        return { success: true }
    } catch (error) {
        console.error("Failed to update order:", error)
        return { success: false, error: "Failed to update" }
    }
}

export async function updateMenuItemStatus(itemId: string, active: boolean) {
    await enforcePermission('MENU', 'EDIT')
    try {
        await db.menuItem.update({
            where: { id: itemId },
            data: { active }
        })
        revalidatePath("/admin/menu")
        revalidatePath("/menu") // Update public menu too
        await logAction("UPDATE_MENU_ITEM_STATUS", `Item ${itemId} active: ${active}`, itemId)
        return { success: true }
    } catch (error) {
        console.error("Failed to update menu item:", error)
        return { success: false, error: "Failed to update" }
    }
}

export async function updateInventoryItem(id: string, data: { quantity?: number, cost?: number, minStock?: number }) {
    await enforcePermission('INVENTORY', 'EDIT')
    try {
        await db.inventoryItem.update({
            where: { id },
            data
        })
        revalidatePath("/admin/inventory")
        await logAction("UPDATE_INVENTORY", `Item ${id} updated`, id)
        return { success: true }
    } catch (error) {
        console.error("Inventory Update Error:", error)
        return { success: false, error: "Failed to update inventory" }
    }
}

export async function deleteMenuItem(id: string) {
    await enforcePermission('MENU', 'EDIT')
    try {
        await db.menuItem.delete({ where: { id } })
        await logAction("DELETE_MENU_ITEM", `Item ${id} deleted`, id)
        revalidatePath("/admin/menu")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete" }
    }
}

export async function createMenuItem(data: any) {
    await enforcePermission('MENU', 'EDIT')
    try {
        const { ingredients, ...itemData } = data
        await db.menuItem.create({
            data: {
                ...itemData,
                ingredients: {
                    create: ingredients // Expects array of { name, quantity }
                }
            }
        })
        revalidatePath("/admin/menu")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to create" }
    }
}

export async function updateMenuItemFull(id: string, data: any) {
    await enforcePermission('MENU', 'EDIT')
    try {
        const { ingredients, ...itemData } = data

        // Transaction to update item and replace ingredients
        await db.$transaction(async (tx) => {
            await tx.menuItem.update({
                where: { id },
                data: itemData
            })

            if (ingredients) {
                // Delete existing ingredients
                await tx.ingredient.deleteMany({ where: { menuItemId: id } })
                // Create new ones
                await tx.ingredient.createMany({
                    data: ingredients.map((ing: any) => ({
                        menuItemId: id,
                        name: ing.name,
                        quantity: ing.quantity
                    }))
                })
            }
        })

        revalidatePath("/admin/menu")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to update" }
    }
}

export async function addInventoryItem(locationId: string, data: { name: string, quantity: number, unit: string, cost: number, minStock: number }) {
    await enforcePermission('INVENTORY', 'EDIT')
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
