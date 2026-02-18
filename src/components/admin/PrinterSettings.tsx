"use client"
import { useState, useEffect } from "react"
import { ReceiptData, printReceipt } from "@/lib/printer"
import { printToNetworkPrinter } from "@/lib/network-printer"

// We will store printer settings in localStorage for now as it is device-specific
// In a real enterprise app, this might be stored in the DB per "Terminal" or "Station"

type PrinterConfig = {
    id: string
    name: string
    type: "NETWORK" | "USB" | "BLUETOOTH"
    ip?: string
    port?: string
    width: "58mm" | "80mm"
}

export function PrinterSettings() {
    const [printers, setPrinters] = useState<PrinterConfig[]>([])
    const [isAdding, setIsAdding] = useState(false)
    const [newPrinter, setNewPrinter] = useState<Partial<PrinterConfig>>({ type: "NETWORK", width: "80mm" })

    useEffect(() => {
        const saved = localStorage.getItem("printer_config")
        if (saved) {
            setPrinters(JSON.parse(saved))
        }
    }, [])

    const savePrinters = (updated: PrinterConfig[]) => {
        setPrinters(updated)
        localStorage.setItem("printer_config", JSON.stringify(updated))
    }

    const addPrinter = () => {
        if (!newPrinter.name) return
        const printer: PrinterConfig = {
            id: crypto.randomUUID(),
            name: newPrinter.name,
            type: newPrinter.type as any,
            ip: newPrinter.ip,
            width: newPrinter.width as any
        }
        savePrinters([...printers, printer])
        setIsAdding(false)
        setNewPrinter({ type: "NETWORK", width: "80mm" })
    }

    const deletePrinter = (id: string) => {
        savePrinters(printers.filter(p => p.id !== id))
    }

    import { ReceiptData, printReceipt } from "@/lib/printer"
    import { printToNetworkPrinter } from "@/lib/network-printer"

    // ... inside component

    const testPrint = async (printer: PrinterConfig) => {
        const dummyReceipt: ReceiptData = {
            storeName: "De Cuadros",
            storeAddress: "C/ Falsa 123, Madrid",
            orderId: "TEST-001",
            date: new Date().toLocaleString(),
            items: [
                { name: "Burger Clásica", quantity: 1, price: 12.50 },
                { name: "Patatas Bravas", quantity: 1, price: 6.00 }
            ],
            subtotal: 18.50,
            tax: 1.85,
            total: 20.35,
            paymentMethod: "TEST"
        }

        try {
            if (printer.type === "NETWORK" && printer.ip) {
                // Try network print first (ePOS)
                // Note: This often fails due to CORS if not proxied or configured on printer
                alert(`Intentando imprimir en red a ${printer.ip}...`)
                await printToNetworkPrinter(printer.ip, 9100, dummyReceipt) // Port is placeholder
            } else {
                // Fallback to browser print
                printReceipt(dummyReceipt)
            }
        } catch (error) {
            console.error("Print failed:", error)
            alert("Error al imprimir. Revisa la consola o usa impresión normal.")
            // Fallback
            printReceipt(dummyReceipt)
        }
    }

    return (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined">print</span>
                    Impresoras (Local)
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-amber-500 text-black px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-400"
                >
                    + Añadir Impresora
                </button>
            </div>

            <div className="space-y-4">
                {printers.map(printer => (
                    <div key={printer.id} className="bg-slate-950 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <div className="font-bold text-white">{printer.name}</div>
                            <div className="text-xs text-slate-400">
                                {printer.type} • {printer.width} {printer.ip && `• ${printer.ip}`}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => testPrint(printer)}
                                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20"
                            >
                                Probar
                            </button>
                            <button
                                onClick={() => deletePrinter(printer.id)}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                ))}

                {printers.length === 0 && !isAdding && (
                    <div className="text-center text-slate-500 py-8 text-sm">
                        No hay impresoras configuradas en este dispositivo.
                    </div>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4">Nueva Impresora</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs uppercase text-slate-500 mb-1">Nombre</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                                    placeholder="Ej. Cocina, Barra..."
                                    value={newPrinter.name || ""}
                                    onChange={e => setNewPrinter({ ...newPrinter, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs uppercase text-slate-500 mb-1">Tipo</label>
                                    <select
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                                        value={newPrinter.type}
                                        onChange={e => setNewPrinter({ ...newPrinter, type: e.target.value as any })}
                                    >
                                        <option value="NETWORK">WiFi / LAN</option>
                                        <option value="USB">USB (WebUSB)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-slate-500 mb-1">Ancho</label>
                                    <select
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                                        value={newPrinter.width}
                                        onChange={e => setNewPrinter({ ...newPrinter, width: e.target.value as any })}
                                    >
                                        <option value="80mm">80mm (Estándar)</option>
                                        <option value="58mm">58mm (Pequeña)</option>
                                    </select>
                                </div>
                            </div>
                            {newPrinter.type === "NETWORK" && (
                                <div>
                                    <label className="block text-xs uppercase text-slate-500 mb-1">IP de la Impresora</label>
                                    <input
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                                        placeholder="192.168.1.200"
                                        value={newPrinter.ip || ""}
                                        onChange={e => setNewPrinter({ ...newPrinter, ip: e.target.value })}
                                    />
                                    <p className="text-[10px] text-amber-500 mt-1">
                                        * Nota: Para imprimir por red desde la web, el navegador puede bloquear conexiones a IPs locales si no se configura un proxy.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={addPrinter}
                                className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
