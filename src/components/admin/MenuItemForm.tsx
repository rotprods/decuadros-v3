"use client"
import { useState } from "react"
import { createMenuItem, updateMenuItemFull } from "@/app/actions/admin"

type MenuItemFormProps = {
    categories: any[]
    initialData?: any
    onClose: () => void
}

export function MenuItemForm({ categories, initialData, onClose }: MenuItemFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price || 0,
        categoryId: initialData?.categoryId || categories[0]?.id || "",
        station: initialData?.station || "KITCHEN",
        image: initialData?.image || "",
        ingredients: initialData?.ingredients || [] // Array of { name, quantity }
    })

    const handleChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleIngredientChange = (index: number, field: string, value: any) => {
        const newIngredients = [...formData.ingredients]
        newIngredients[index] = { ...newIngredients[index], [field]: value }
        setFormData(prev => ({ ...prev, ingredients: newIngredients }))
    }

    const addIngredient = () => {
        setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: "", quantity: 1 }] }))
    }

    const removeIngredient = (index: number) => {
        setFormData(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }))
    }

    // Calculate theoretical cost based on ingredients and assumed average cost or manual input
    // For now, we will add a costPerUnit input to ingredients in this form
    const theoreticalCost = formData.ingredients.reduce((acc, ing: any) => acc + (ing.quantity * (ing.costPerUnit || 0)), 0)
    const margin = formData.price > 0 ? ((formData.price - theoreticalCost) / formData.price) * 100 : 0

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        try {
            const dataToSubmit = {
                ...formData,
                price: parseFloat(formData.price.toString()),
                ingredients: formData.ingredients.map((ing: any) => ({
                    name: ing.name,
                    quantity: parseFloat(ing.quantity.toString()),
                    // We don't save costPerUnit to Ingredient model yet unless we migrate schema.
                    // But we can save it to InventoryItem if we matched it.
                    // For this iteration, let's just show the calculation.
                }))
            }
            // ... rest of submit

            if (initialData) {
                await updateMenuItemFull(initialData.id, dataToSubmit)
            } else {
                await createMenuItem(dataToSubmit)
            }
            onClose()
        } catch (error) {
            console.error("Form Error:", error)
            alert("Error saving item")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {initialData ? "Editar Plato" : "Nuevo Plato"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Nombre</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Precio (€)</label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white h-24"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Categoría</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Puesto (KDS)</label>
                            <select
                                name="station"
                                value={formData.station}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                            >
                                <option value="KITCHEN">Cocina</option>
                                <option value="BAR">Barra</option>
                                <option value="PIZZA">Horno Pizza</option>
                                <option value="DESSERT">Postres</option>
                            </select>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-white">Ingredientes (para stock)</label>
                            <button type="button" onClick={addIngredient} className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded hover:bg-amber-500/20">
                                + Añadir
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.ingredients.map((ing: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input
                                        placeholder="Nombre (ej. Pan Burger)"
                                        value={ing.name}
                                        onChange={(e) => handleIngredientChange(i, "name", e.target.value)}
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-white"
                                    />
                                    <div className="flex flex-col w-20">
                                        <input
                                            type="number"
                                            placeholder="Ud."
                                            step="0.01"
                                            value={ing.quantity}
                                            onChange={(e) => handleIngredientChange(i, "quantity", e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-white text-right"
                                        />
                                        <span className="text-[10px] text-slate-500 text-center">Cant.</span>
                                    </div>
                                    <div className="flex flex-col w-24">
                                        <input
                                            type="number"
                                            placeholder="€/u"
                                            step="0.01"
                                            value={ing.costPerUnit || ""}
                                            onChange={(e) => handleIngredientChange(i, "costPerUnit", parseFloat(e.target.value))}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-white text-right"
                                        />
                                        <span className="text-[10px] text-slate-500 text-center">Coste Unit.</span>
                                    </div>
                                    <button type="button" onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-300 p-2">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl flex justify-between items-center text-sm">
                            <div className="text-slate-400">
                                Coste Teórico: <span className="text-white font-bold">{theoreticalCost.toFixed(2)}€</span>
                            </div>
                            <div className={margin < 70 ? "text-red-400" : "text-green-400"}>
                                Margen: <span className="font-bold">{margin.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50">
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
