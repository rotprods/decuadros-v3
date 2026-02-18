"use client"
import { useState, useTransition } from "react"
import { openCashSession, closeCashSession } from "@/app/actions/cash"

type Session = {
    id: string
    startTime: Date
    endTime: Date | null
    startAmount: number
    endAmount: number | null
    opener: { name: string | null }
}

export function CashSessionManager({ currentSession, history, locationId }: { currentSession: Session | null, history: Session[], locationId: string }) {
    const [isPending, startTransition] = useTransition()
    const [amount, setAmount] = useState<string>("")
    const [notes, setNotes] = useState("")

    const handleOpen = () => {
        startTransition(async () => {
            const res = await openCashSession(locationId, parseFloat(amount) || 0)
            if (res.success) setAmount("")
        })
    }

    const handleClose = () => {
        startTransition(async () => {
            const res = await closeCashSession(currentSession!.id, parseFloat(amount) || 0, notes)
            if (res.success) {
                setAmount("")
                setNotes("")
            }
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                        Estado: {currentSession ? <span className="text-green-400">ABIERTA</span> : <span className="text-red-400">CERRADA</span>}
                    </h3>

                    {!currentSession ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-400 mb-1">Fondo de Caja (€)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white text-lg font-mono focus:border-green-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <button
                                onClick={handleOpen}
                                disabled={isPending || !amount}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 disabled:opacity-50"
                            >
                                {isPending ? "Abriendo..." : "Abrir Caja"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-slate-400">Abierta por</p>
                                <p className="text-white font-medium">{currentSession.opener.name}</p>
                                <p className="text-xs text-slate-400 mt-2">Fondo Inicial</p>
                                <p className="text-white font-mono text-xl">{currentSession.startAmount.toFixed(2)}€</p>
                                <p className="text-xs text-slate-400 mt-2">Hora de apertura</p>
                                <p className="text-white font-mono">{currentSession.startTime.toLocaleTimeString()}</p>
                            </div>

                            <hr className="border-white/10" />

                            <div>
                                <label className="block text-xs uppercase text-slate-400 mb-1">Recuento Final (€)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white text-lg font-mono focus:border-red-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-slate-400 mb-1">Notas</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-red-500 outline-none"
                                    rows={2}
                                />
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isPending || !amount}
                                className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500 disabled:opacity-50"
                            >
                                {isPending ? "Cerrando..." : "Cerrar Caja (Z)"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="font-bold text-white">Historial de Cierres</h3>
                    </div>
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Responsable</th>
                                <th className="px-6 py-4 text-right">Inicio</th>
                                <th className="px-6 py-4 text-right">Fin</th>
                                <th className="px-6 py-4 text-right">Resultado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map((s) => (
                                <tr key={s.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4">
                                        {s.startTime.toLocaleDateString()} <br />
                                        <span className="text-xs opacity-50">{s.startTime.toLocaleTimeString()} - {s.endTime?.toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-4">{s.opener.name}</td>
                                    <td className="px-6 py-4 text-right font-mono">{s.startAmount.toFixed(2)}€</td>
                                    <td className="px-6 py-4 text-right font-mono">{s.endAmount?.toFixed(2) || '-'}€</td>
                                    <td className="px-6 py-4 text-right">
                                        {s.endAmount ? (
                                            <span className={(s.endAmount - s.startAmount) >= 0 ? "text-green-400 font-mono" : "text-red-400 font-mono"}>
                                                {(s.endAmount - s.startAmount).toFixed(2)}€
                                            </span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
