export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-6xl mb-4">📶</span>
            <h1 className="text-2xl font-bold text-white mb-2">Sin Conexión</h1>
            <p className="text-slate-400 mb-6">
                Parece que has perdido la conexión a internet.
                <br />
                No te preocupes, puedes seguir tomando comandas y se sincronizarán cuando vuelvas a estar online.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-amber-400"
            >
                Reintentar
            </button>
        </div>
    )
}
