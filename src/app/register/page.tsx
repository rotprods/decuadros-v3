// ═══ REGISTER — Mediterranean ═══
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('')
        try {
            const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
            if (!res.ok) { const d = await res.json(); setError(d.message || 'Error al registrar'); setLoading(false); return }
            setSuccess(true)
        } catch { setError('Error de conexión'); setLoading(false) }
    }

    if (success) return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <div className="card-marble text-center max-w-sm animate-slide-up">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>¡Bienvenido!</h2>
                <p className="text-sm text-[#9A9A9A] mb-4">Tu cuenta ha sido creada. Ya puedes iniciar sesión.</p>
                <Link href="/login" className="btn-olive inline-block">Iniciar Sesión</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <div className="w-full max-w-sm">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="text-5xl mb-4">🫒</div>
                    <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Crear Cuenta</h1>
                    <p className="text-[#9A9A9A] mt-2 text-sm italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Únete a la experiencia De Cuadros</p>
                </div>

                <form onSubmit={handleRegister} className="card-marble animate-slide-up">
                    {error && <div className="bg-[#C4764E]/10 border border-[#C4764E]/20 text-[#C4764E] text-sm rounded-lg p-3 mb-4">{error}</div>}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Nombre</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" required className="input-premium" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required className="input-premium" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Contraseña</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className="input-premium" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-olive w-full disabled:opacity-50">{loading ? 'Creando...' : '🌿 Crear Cuenta'}</button>
                </form>

                <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-sm text-[#9A9A9A]">¿Ya tienes cuenta? <Link href="/login" className="text-[#5B7A5E] font-semibold hover:underline">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    )
}
