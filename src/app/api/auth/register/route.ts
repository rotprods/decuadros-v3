// ═══ AUTH API — Register ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1).max(50).optional(),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, password, name } = registerSchema.parse(body)

        // Check if user exists
        const existing = await db.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user + pet
        const user = await db.user.create({
            data: {
                email,
                hashedPassword,
                name: name || 'Crack',
                referralCode: 'DC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                pet: { create: { name: 'Pulpi', stage: 0, mood: 80, actions: 0 } },
            },
            select: { id: true, email: true, name: true, avatar: true, tier: true, points: true },
        })

        // Welcome notification
        await db.notification.create({
            data: {
                userId: user.id,
                icon: '🎉',
                title: '¡Bienvenido a De Cuadros!',
                message: 'Tu aventura gastronómica comienza ahora. +50 pts de bienvenida.',
            },
        })

        // Welcome bonus
        await db.user.update({
            where: { id: user.id },
            data: { points: { increment: 50 }, totalXP: { increment: 50 } },
        })

        return NextResponse.json({ user }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Register error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
