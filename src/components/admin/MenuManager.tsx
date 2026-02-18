"use client"
import { updateMenuItemStatus } from "@/app/actions/admin"
import { useTransition } from "react"

export function MenuManager({ categories }: { categories: any[] }) {
    return (
        <div className="space-y-8">
            {categories.map((category) => (
                <div key={category.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="bg-slate-950 p-4 border-b border-white/10 flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="font-bold text-lg text-white">{category.name}</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {category.items.map((item: any) => (
                            <MenuItemRow key={item.id} item={item} />
                        ))}
                        {category.items.length === 0 && (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No hay productos en esta categoría.
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function MenuItemRow({ item }: { item: any }) {
    const [isPending, startTransition] = useTransition()

    const toggleActive = () => {
        startTransition(async () => {
            await updateMenuItemStatus(item.id, !item.active)
        })
    }

    return (
        <div className={`p-4 flex items-center justify-between transition-colors hover:bg-white/5 ${!item.active ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex items-center gap-4">
                {/* Image Placeholder or Actual Image */}
                <div className="h-12 w-12 rounded-lg bg-slate-800 overflow-hidden relative">
                    {item.image && <img src={item.image} alt={item.name} className="object-cover w-full h-full" />}
                </div>
                <div>
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <p className="text-sm text-slate-400">{item.price.toFixed(2)}€</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${item.active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {item.active ? 'ACTIVO' : 'NO DISPONIBLE'}
                </span>

                <button
                    onClick={toggleActive}
                    disabled={isPending}
                    className={`p-2 rounded-lg transition-colors ${item.active ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-green-500/20 text-green-400'}`}
                    title={item.active ? "Desactivar" : "Activar"}
                >
                    <span className="material-symbols-outlined">
                        {item.active ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>
        </div>
    )
}
