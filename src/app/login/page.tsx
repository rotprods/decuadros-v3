// ═══ LOGIN — Mediterranean Premium ═══
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
            const data = await res.json()
            if (!res.ok) {
                if (data.error === 'no_account') { window.location.href = '/auth-error'; return }
                if (data.error === 'oauth_account') { setError('Esta cuenta usa Google. Usa el botón de Google.'); setLoading(false); return }
                setError(data.error === 'wrong_password' ? 'Contraseña incorrecta' : data.message || 'Error al iniciar sesión')
                setLoading(false); return
            }
            const csrfRes = await fetch('/api/auth/csrf')
            const csrfData = await csrfRes.json()
            const form = new URLSearchParams()
            form.append('email', email); form.append('password', password)
            form.append('csrfToken', csrfData.csrfToken); form.append('redirect', 'false'); form.append('json', 'true')
            const signIn = await fetch('/api/auth/callback/credentials', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString(), redirect: 'manual' })
            if (signIn.status === 200 || signIn.status === 302 || signIn.type === 'opaqueredirect') {
                window.history.replaceState(null, '', '/app'); window.location.replace('/app')
            } else { setError('Error al crear sesión'); setLoading(false) }
        } catch { setError('Error de conexión'); setLoading(false) }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
            <div className="w-full max-w-sm">
                <div className="text-center mb-10 animate-fade-in">
                    <div className="text-5xl mb-4">🫒</div>
                    <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>De Cuadros</h1>
                    <p className="text-[#9A9A9A] mt-2 text-sm italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Cocina mediterránea de fusión</p>
                </div>

                <form onSubmit={handleLogin} className="card-marble animate-slide-up">
                    {error && (
                        <div className="bg-[#C4764E]/10 border border-[#C4764E]/20 text-[#C4764E] text-sm rounded-lg p-3 mb-4">{error}</div>
                    )}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required className="input-premium" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Contraseña</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required minLength={6} className="input-premium" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-olive w-full text-center disabled:opacity-50">
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                    <div className="mt-4 p-3 bg-[#5B7A5E]/5 rounded-lg text-center">
                        <p className="text-xs text-[#9A9A9A]">Demo: <span className="text-[#5B7A5E] font-medium">demo@decuadros.es</span> / <span className="text-[#5B7A5E] font-medium">demo123</span></p>
                    </div>
                </form>

                <div className="text-center mt-6 space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-sm text-[#9A9A9A]">¿Sin cuenta? <Link href="/register" className="text-[#5B7A5E] font-semibold hover:underline">Regístrate</Link></p>
                    <Link href="/" className="text-xs text-[#9A9A9A] hover:text-[#6B6B6B]">← Volver al inicio</Link>
                </div>
            </div>
        </div>
    )
}
