"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const adminLinks = [
    { name: "Resumen", href: "/admin", icon: "dashboard" },
    { name: "Pedidos", href: "/admin/orders", icon: "list_alt" },
    { name: "Pantalla Cocina", href: "/admin/kds", icon: "soup_kitchen" },
    { name: "Carta", href: "/admin/menu", icon: "restaurant_menu" },
    { name: "Clientes", href: "/admin/users", icon: "group" },
    { name: "Reportes", href: "/admin/reports/cost", icon: "monitoring" },
    { name: "Configuración", href: "/admin/settings/printers", icon: "settings" },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col bg-slate-900 text-white transition-transform">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">shield_person</span>
                    El Jefe
                </h1>
                <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {adminLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20"
                                : "hover:bg-white/5 text-slate-300 hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined">{link.icon}</span>
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/10 bg-slate-950/50">
                <Link href="/app" className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-colors">
                    <span className="material-symbols-outlined">logout</span>
                    Salir a App
                </Link>
            </div>
        </aside>
    )
}
