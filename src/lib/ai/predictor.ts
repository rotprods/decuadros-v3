import { db } from "@/lib/db"

type PredictionResult = {
    date: string
    predictedSales: number
    confidence: number
}

export const SalesPredictor = {
    /**
     * Predict sales for a specific date based on historical data (same day of week)
     */
    predictSales: async (date: Date): Promise<PredictionResult> => {
        const dayOfWeek = date.getDay()

        // Fetch last 4 weeks of sales for this day of week
        // In a real app, we'd do complex SQL. Here we fetch all orders and filter (MVP) or use a raw query.
        // Let's use a raw query for efficiency if possible, or simple aggregation.
        // For MVP: Fetch last 30 days of orders, filter by day of week.

        const thirtyDaysAgo = new Date(date)
        thirtyDaysAgo.setDate(date.getDate() - 30)

        const orders = await db.order.findMany({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                    lt: date
                },
                status: { not: "CANCELLED" }
            },
            select: {
                createdAt: true,
                total: true
            }
        })

        // Filter by same day of week
        const matchingDays = orders.filter(o => o.createdAt.getDay() === dayOfWeek)

        // Group by Date to get daily totals
        const dailyTotals = new Map<string, number>()
        matchingDays.forEach(o => {
            const dateStr = o.createdAt.toISOString().split('T')[0]
            dailyTotals.set(dateStr, (dailyTotals.get(dateStr) || 0) + o.total)
        })

        const totals = Array.from(dailyTotals.values())
        if (totals.length === 0) {
            return { date: date.toISOString(), predictedSales: 0, confidence: 0 }
        }

        // Simple Moving Average
        const avg = totals.reduce((a, b) => a + b, 0) / totals.length

        return {
            date: date.toISOString(),
            predictedSales: avg,
            confidence: 0.8 // Arbitrary for MVP
        }
    },

    /**
     * Check stock levels against predicted sales to generate alerts
     */
    generateStockAlerts: async () => {
        // 1. Get predicted sales for next 3 days
        // 2. Estimate ingredient usage (this is hard without full recipe breakdown for every historical order)
        // MVP: Just alert on low stock items defined by minStock

        const allItems = await db.inventoryItem.findMany({
            where: { active: true }
        })

        const lowStockItems = allItems.filter(item => item.quantity <= item.minStock)

        return lowStockItems.map(item => ({
            type: "LOW_STOCK",
            message: `Stock bajo: ${item.name} (${item.quantity} ${item.unit}). Mínimo: ${item.minStock}`,
            priority: "HIGH",
            itemId: item.id
        }))
    }
}
