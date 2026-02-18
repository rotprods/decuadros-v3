"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Report to Sentry automatically
        Sentry.captureException(error)
    }, [error])

    return (
        <html>
            <body className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6">⚠️</div>
                    <h1 className="text-3xl font-black text-white mb-3">
                        Algo salió mal
                    </h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Se ha producido un error inesperado. Nuestro equipo ha sido notificado automáticamente.
                    </p>
                    {process.env.NODE_ENV === "development" && (
                        <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-4 mb-6 text-left">
                            <p className="text-red-400 text-sm font-mono break-all">{error.message}</p>
                        </div>
                    )}
                    <button
                        onClick={reset}
                        className="bg-amber-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-amber-400 transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </body>
        </html>
    )
}
