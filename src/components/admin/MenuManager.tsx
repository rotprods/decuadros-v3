"use client"
import { updateMenuItemStatus, deleteMenuItem } from "@/app/actions/admin"
import { useTransition, useState } from "react"
import { MenuItemForm } from "./MenuItemForm"

export function MenuManager({ categories }: { categories: any[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    const handleEdit = (item: any) => {
        setEditingItem(item)
        setIsFormOpen(true)
    }

    const handleAdd = () => {
        setEditingItem(null)
        setIsFormOpen(true)
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button
                    onClick={handleAdd}
                    className="bg-amber-500 text-black px-4 py-2 rounded-xl font-bold hover:bg-amber-400 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Plato
                </button>
            </div>

            {categories.map((category) => (
                <div key={category.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="bg-slate-950 p-4 border-b border-white/10 flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="font-bold text-lg text-white">{category.name}</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {category.items.map((item: any) => (
                            <MenuItemRow key={item.id} item={item} onEdit={handleEdit} />
                        ))}
                        {category.items.length === 0 && (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No hay productos en esta categoría.
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {isFormOpen && (
                <MenuItemForm
                    categories={categories}
                    initialData={editingItem}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    )
}

function MenuItemRow({ item, onEdit }: { item: any, onEdit: (item: any) => void }) {
    const [isPending, startTransition] = useTransition()

    const toggleActive = () => {
        startTransition(async () => {
            await updateMenuItemStatus(item.id, !item.active)
        })
    }

    const handleDelete = async () => {
        if (confirm("¿Seguro que quieres eliminar este plato?")) {
            startTransition(async () => {
                await deleteMenuItem(item.id)
            })
        }
    }

    return (
        <div className={`p-4 flex items-center justify-between transition-colors hover:bg-white/5 ${!item.active ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-slate-800 overflow-hidden relative">
                    {item.image && <img src={item.image} alt={item.name} className="object-cover w-full h-full" />}
                </div>
                <div>
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <p className="text-sm text-slate-400">{item.price.toFixed(2)}€</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400"
                    title="Editar"
                >
                    <span className="material-symbols-outlined">edit</span>
                </button>

                <button
                    onClick={toggleActive}
                    disabled={isPending}
                    className={`p-2 rounded-lg transition-colors ${item.active ? 'hover:bg-amber-500/20 text-amber-500' : 'hover:bg-green-500/20 text-green-400'}`}
                    title={item.active ? "Desactivar" : "Activar"}
                >
                    <span className="material-symbols-outlined">
                        {item.active ? 'visibility_off' : 'visibility'}
                    </span>
                </button>

                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-500"
                    title="Eliminar"
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    )
}
