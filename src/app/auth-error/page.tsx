// ═══ AUTH ERROR — Mediterranean ═══
import Link from 'next/link'

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <div className="card-marble text-center max-w-sm animate-slide-up">
                <div className="text-5xl mb-4">😔</div>
                <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Cuenta no encontrada</h1>
                <p className="text-sm text-[#9A9A9A] mb-6">No existe una cuenta con ese email. ¿Quieres crear una?</p>
                <div className="flex gap-3 justify-center">
                    <Link href="/register" className="btn-olive">Crear Cuenta</Link>
                    <Link href="/login" className="btn-outline">Volver</Link>
                </div>
            </div>
        </div>
    )
}
