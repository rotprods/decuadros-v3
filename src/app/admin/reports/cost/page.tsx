import { prisma } from "@/lib/prisma"
import { enforcePermission } from "@/lib/rbac"

export default async function CostReportPage() {
    await enforcePermission("INVENTORY", "read") // Or separate REPORT permission

    // Fetch all menu items with ingredients
    const menuItems = await prisma.menuItem.findMany({
        where: { active: true },
        include: {
            ingredients: true
        }
    })

    // Simplify: In a real app we'd fetch actual cost from InventoryItem
    // Here we'll rely on the idea that the Ingredient model *could* have cost,
    // or we fetch InventoryItems to match by name.
    // For this prototype, we'll assume the simple math we just added is visual-only
    // but typically we'd map ingredient.name -> inventoryItem.cost

    const inventoryItems = await prisma.inventoryItem.findMany()
    const costMap = new Map(inventoryItems.map(i => [i.name, i.cost]))

    const reportData = menuItems.map(item => {
        const theoreticalCost = item.ingredients.reduce((acc, ing) => {
            const cost = costMap.get(ing.name) || 0
            return acc + (ing.quantity * cost)
        }, 0)

        const margin = item.price > 0 ? ((item.price - theoreticalCost) / item.price) * 100 : 0

        return {
            id: item.id,
            name: item.name,
            price: item.price,
            cost: theoreticalCost,
            margin,
            category: item.categoryId // We'd fetch category name in real app
        }
    }).sort((a, b) => a.margin - b.margin) // Sort by lowest margin first (problem items)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Reporte de Costes</h1>
                    <p className="text-slate-400 mt-1">Análisis de margen teórico basado en inventario.</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-200 font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Plato</th>
                            <th className="p-4 text-right">PVP (Sin IVA)</th>
                            <th className="p-4 text-right">Coste Teórico</th>
                            <th className="p-4 text-right">Beneficio</th>
                            <th className="p-4 text-right">Margen %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {reportData.map(row => (
                            <tr key={row.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-white">{row.name}</td>
                                <td className="p-4 text-right">{row.price.toFixed(2)}€</td>
                                <td className="p-4 text-right text-amber-500 font-mono">{row.cost.toFixed(2)}€</td>
                                <td className="p-4 text-right font-mono">{(row.price - row.cost).toFixed(2)}€</td>
                                <td className="p-4 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${row.margin < 30 ? "bg-red-500/20 text-red-500" :
                                            row.margin < 60 ? "bg-amber-500/20 text-amber-500" :
                                                "bg-green-500/20 text-green-500"
                                        }`}>
                                        {row.margin.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-slate-500 text-xs uppercase font-bold mb-2">Coste Medio Materia Prima</h3>
                    <div className="text-3xl font-black text-white">
                        {(reportData.length > 0 ? (reportData.reduce((a, b) => a + (b.cost / b.price), 0) / reportData.length) * 100 : 0).toFixed(1)}%
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-slate-500 text-xs uppercase font-bold mb-2">Plato Menor Margen</h3>
                    <div className="text-xl font-bold text-red-400 truncate">
                        {reportData[0]?.name || "-"}
                    </div>
                    <div className="text-sm text-slate-400">
                        {reportData[0]?.margin.toFixed(1)}% margen
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-slate-500 text-xs uppercase font-bold mb-2">Plato Mayor Margen</h3>
                    <div className="text-xl font-bold text-green-400 truncate">
                        {reportData[reportData.length - 1]?.name || "-"}
                    </div>
                    <div className="text-sm text-slate-400">
                        {reportData[reportData.length - 1]?.margin.toFixed(1)}% margen
                    </div>
                </div>
            </div>
        </div>
    )
}
