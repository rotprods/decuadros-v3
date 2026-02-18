"use client"
import { updateInventoryItem, addInventoryItem } from "@/app/actions/admin"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export function InventoryList({ items, locationId }: { items: any[], locationId: string }) {
    const [isPending, startTransition] = useTransition()
    const [isAdding, setIsAdding] = useState(false)

    // New Item State
    const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: 'units', cost: 0, minStock: 5 })

    const handleUpdate = (id: string, field: string, value: number) => {
        startTransition(async () => {
            await updateInventoryItem(id, { [field]: value })
        })
    }

    const handleCreate = async () => {
        startTransition(async () => {
            await addInventoryItem(locationId, newItem)
            setIsAdding(false)
            setNewItem({ name: '', quantity: 0, unit: 'units', cost: 0, minStock: 5 })
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-400"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Ingrediente
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-900 border border-amber-500/50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-6 gap-4 items-end animate-in fade-in slide-in-from-top-2">
                    <div className="md:col-span-2">
                        <label className="text-xs text-slate-400">Nombre</label>
                        <input
                            type="text"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white"
                            placeholder="Ej. Harina"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Cantidad</label>
                        <input
                            type="number"
                            value={newItem.quantity}
                            onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Unidad</label>
                        <select
                            value={newItem.unit}
                            onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="units">Unidades</option>
                            <option value="kg">Kg</option>
                            <option value="g">g</option>
                            <option value="L">Litros</option>
                            <option value="ml">ml</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Coste Unit.</label>
                        <input
                            type="number"
                            value={newItem.cost}
                            onChange={e => setNewItem({ ...newItem, cost: parseFloat(e.target.value) })}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={isPending}
                        className="bg-green-600 text-white font-bold p-2 rounded-lg flex items-center justify-center hover:bg-green-500"
                    >
                        <span className="material-symbols-outlined">check</span>
                    </button>
                </div>
            )}

            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Ingrediente</th>
                            <th className="px-6 py-4">Stock Actual</th>
                            <th className="px-6 py-4">Unidad</th>
                            <th className="px-6 py-4">Coste Unit.</th>
                            <th className="px-6 py-4">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        defaultValue={item.quantity}
                                        onBlur={(e) => handleUpdate(item.id, 'quantity', parseFloat(e.target.value))}
                                        className={`bg-transparent border-b border-white/10 w-24 text-center focus:border-amber-500 focus:outline-none ${item.quantity <= item.minStock ? 'text-red-400 font-bold' : ''}`}
                                    />
                                </td>
                                <td className="px-6 py-4">{item.unit}</td>
                                <td className="px-6 py-4">{item.cost.toFixed(2)}€</td>
                                <td className="px-6 py-4">
                                    {item.quantity <= item.minStock ? (
                                        <span className="text-red-400 flex items-center gap-1 text-xs font-bold">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            BAJO STOCK
                                        </span>
                                    ) : (
                                        <span className="text-green-400 text-xs font-bold">OK</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
