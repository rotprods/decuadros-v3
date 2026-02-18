"use client"
import { useState, useEffect } from "react"
import { getSystemSettings, updateSystemSetting } from "@/app/actions/settings"

const SECTIONS = [
    {
        id: "GENERAL",
        title: "Negocio & Contacto",
        icon: "storefront",
        fields: [
            { key: "site_name", label: "Nombre del Sitio", type: "text" },
            { key: "site_description", label: "Descripción Corta", type: "text" },
            { key: "contact_phone", label: "Teléfono (WhatsApp)", type: "text" },
            { key: "contact_address", label: "Dirección", type: "text" },
        ]
    },
    {
        id: "OPERATIONS",
        title: "Operaciones & Horarios",
        icon: "schedule",
        fields: [
            { key: "store_hours", label: "Horario Visible", type: "text", placeholder: "L-D: 13:00-23:00" },
            { key: "stock_safety_margin", label: "Margen Stock (%)", type: "number" },
            { key: "preparation_time", label: "Tiempo Prep. (min)", type: "number" },
        ]
    },
    {
        id: "SERVICES",
        title: "Servicios & Delivery",
        icon: "moped",
        fields: [
            { key: "service_delivery", label: "Delivery Activo", type: "boolean" },
            { key: "service_pickup", label: "Recogida Activo", type: "boolean" },
            { key: "service_dinein", label: "Pedidos en Mesa", type: "boolean" },
            { key: "delivery_min_order", label: "Pedido Mínimo (€)", type: "number" },
            { key: "delivery_fee", label: "Coste Envío (€)", type: "number" },
        ]
    },
    {
        id: "APPEARANCE",
        title: "Apariencia & Marca",
        icon: "palette",
        fields: [
            { key: "theme_color", label: "Color Primario (Hex)", type: "color" },
            { key: "site_logo", label: "URL Logo", type: "text" },
            { key: "site_banner", label: "URL Banner", type: "text" },
            { key: "welcome_message", label: "Mensaje Bienvenida", type: "text" },
        ]
    },
    {
        id: "AI",
        title: "Inteligencia Artificial",
        icon: "psychology",
        fields: [
            { key: "ai_enabled", label: "Activar El Jefe AI", type: "boolean" },
            { key: "marketing_auto", label: "Marketing Automático", type: "boolean" },
        ]
    }
]

export default function SettingsManager() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [activeSection, setActiveSection] = useState("GENERAL")

    useEffect(() => {
        getSystemSettings().then(setSettings)
    }, [])

    const handleSave = async (key: string, val: string) => {
        setLoading(true)
        await updateSystemSetting(key, val)
        setSettings(prev => ({ ...prev, [key]: val }))
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Master Control</h1>
                    <p className="text-slate-400">Configura cada aspecto de tu negocio manualmente.</p>
                </div>
            </header>

            <div className="flex gap-6 flex-col md:flex-row">
                {/* Sidebar Navigation */}
                <nav className="w-full md:w-64 space-y-1">
                    {SECTIONS.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-left ${activeSection === section.id
                                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined">{section.icon}</span>
                            {section.title}
                        </button>
                    ))}
                </nav>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                    {SECTIONS.filter(s => s.id === activeSection).map(section => (
                        <div key={section.id} className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {section.fields.map(def => (
                                <div key={def.key} className="bg-slate-900 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
                                            {def.label}
                                        </label>
                                        <p className="text-xs text-slate-500 font-mono">{def.key}</p>
                                    </div>

                                    <div className="flex-1 flex justify-end">
                                        {def.type === "boolean" ? (
                                            <div className="flex bg-slate-950 p-1 rounded-lg border border-white/10">
                                                <button
                                                    onClick={() => handleSave(def.key, "true")}
                                                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${settings[def.key] === "true" ? "bg-green-500 text-black shadow-lg" : "text-slate-500 hover:text-white"}`}
                                                >
                                                    ON
                                                </button>
                                                <button
                                                    onClick={() => handleSave(def.key, "false")}
                                                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${settings[def.key] === "false" ? "bg-red-500 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
                                                >
                                                    OFF
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 w-full max-w-xs">
                                                <input
                                                    type={def.type === "color" ? "color" : "text"}
                                                    value={settings[def.key] || ""}
                                                    placeholder={def.placeholder || ""}
                                                    onChange={(e) => setSettings(prev => ({ ...prev, [def.key]: e.target.value }))}
                                                    className={`bg-slate-950 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-amber-500 transition-colors ${def.type === "color" ? "h-10 w-20 p-1 cursor-pointer" : "flex-1 py-2"}`}
                                                />
                                                <button
                                                    onClick={() => handleSave(def.key, settings[def.key])}
                                                    disabled={loading}
                                                    className="bg-white/10 text-white px-4 rounded-lg font-bold hover:bg-white/20 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-lg">save</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
