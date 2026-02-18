import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// API route for KDS to fetch active orders
// Used by the realtime KitchenDisplay component on change events
export async function GET() {
    try {
        const activeOrders = await db.order.findMany({
            where: {
                status: { in: ["PENDING", "IN_PROGRESS"] }
            },
            include: {
                items: {
                    include: { menuItem: true }
                }
            },
            orderBy: { createdAt: "asc" }
        })

        return NextResponse.json(activeOrders)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }
}
