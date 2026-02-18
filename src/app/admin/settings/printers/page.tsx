import { PrinterSettings } from "@/components/admin/PrinterSettings"

export default function PrintersPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Configuración de Hardware</h1>
            <p className="text-slate-400 mb-8">Gestiona impresoras de tickets y cajones de efectivo.</p>

            <PrinterSettings />
        </div>
    )
}
