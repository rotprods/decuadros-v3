"use client"
import { useState, useEffect } from "react"
import { getSystemSettings, updateSystemSetting } from "@/app/actions/settings"

type Setting = {
    key: string
    value: string
    category: string
    description: string
}

export default function SettingsManager() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    // Hardcoded definition for UI generation, in real app fetch full objects
    const definitions = [
        { key: "site_name", label: "Nombre del Sitio", category: "GENERAL" },
        { key: "welcome_message", label: "Mensaje Bienvenida", category: "GENERAL" },
        { key: "ai_enabled", label: "Activar IA", category: "AI", type: "boolean" },
        { key: "marketing_auto", label: "Marketing Automático", category: "MARKETING", type: "boolean" },
        { key: "stock_safety_margin", label: "Margen Stock (%)", category: "OPERATIONS", type: "number" },
    ]

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
            <h1 className="text-3xl font-black text-white">Panel de Control Maestro</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {definitions.map(def => (
                    <div key={def.key} className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
                        <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">
                            {def.category} — {def.label}
                        </label>

                        {def.type === "boolean" ? (
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleSave(def.key, "true")}
                                    className={`px-4 py-2 rounded-lg font-bold border ${settings[def.key] === "true" ? "bg-green-500 text-black border-transparent" : "border-white/10 text-slate-400"}`}
                                >
                                    ACTIVADO
                                </button>
                                <button
                                    onClick={() => handleSave(def.key, "false")}
                                    className={`px-4 py-2 rounded-lg font-bold border ${settings[def.key] === "false" ? "bg-red-500 text-white border-transparent" : "border-white/10 text-slate-400"}`}
                                >
                                    DESACTIVADO
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    value={settings[def.key] || ""}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [def.key]: e.target.value }))}
                                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                />
                                <button
                                    onClick={() => handleSave(def.key, settings[def.key])}
                                    disabled={loading}
                                    className="bg-amber-500 text-black px-4 rounded-lg font-bold hover:bg-amber-400 disabled:opacity-50"
                                >
                                    Guardar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
