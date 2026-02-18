import { Suspense } from "react"
import Link from "next/link"

function OrderSuccessContent() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                {/* Animated checkmark */}
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <span className="text-5xl">✅</span>
                </div>

                <h1 className="text-4xl font-black text-white mb-3">
                    ¡Pedido Confirmado!
                </h1>
                <p className="text-slate-400 mb-2 text-lg">
                    Tu pago ha sido procesado correctamente.
                </p>
                <p className="text-amber-500 font-semibold mb-8">
                    🎉 Has ganado puntos de fidelidad por este pedido
                </p>

                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
                    <div className="flex items-center gap-3 text-slate-300">
                        <span className="text-2xl">👨‍🍳</span>
                        <div>
                            <p className="font-semibold">Preparando tu pedido</p>
                            <p className="text-sm text-slate-500">La cocina ya está trabajando en ello</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                        <span className="text-2xl">📱</span>
                        <div>
                            <p className="font-semibold">Recibirás una notificación</p>
                            <p className="text-sm text-slate-500">Cuando tu pedido esté listo</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <Link
                        href="/app/dashboard"
                        className="bg-amber-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-colors"
                    >
                        Ir al Dashboard
                    </Link>
                    <Link
                        href="/menu"
                        className="bg-slate-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors border border-white/10"
                    >
                        Ver Menú
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <OrderSuccessContent />
        </Suspense>
    )
}
