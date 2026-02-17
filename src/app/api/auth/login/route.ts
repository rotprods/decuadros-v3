// ═══ LOGIN API — Verifies email + password ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
        return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    // 1. Check if email exists
    const user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
        return NextResponse.json(
            { error: 'no_account', message: 'Este email no está registrado' },
            { status: 404 }
        )
    }

    if (!user.hashedPassword) {
        return NextResponse.json(
            { error: 'oauth_account', message: 'Esta cuenta usa Google. Inicia sesión con Google.' },
            { status: 400 }
        )
    }

    // 2. Check password
    const valid = await bcrypt.compare(password, user.hashedPassword)

    if (!valid) {
        return NextResponse.json(
            { error: 'wrong_password', message: 'Contraseña incorrecta' },
            { status: 401 }
        )
    }

    // 3. Success — return user info (NextAuth will handle session)
    return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
    })
}
