// ═══ ORDERS API ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { awardXP, updateStreak, checkAndAwardBadges } from '@/lib/gamification'
import { z } from 'zod'
import { generateOrderCode } from '@/lib/utils'
import { deductStockForOrder } from '@/app/actions/inventory'

const orderSchema = z.object({
    items: z.array(z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
        notes: z.string().optional(),
    })),
    delivery: z.boolean().default(false),
    notes: z.string().optional(),
    tip: z.number().min(0).default(0),
    couponCode: z.string().optional(),
    locationId: z.string().optional(),
})

// GET /api/orders — Order history
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [orders, total] = await Promise.all([
        db.order.findMany({
            where: { userId: session.user.id },
            include: { items: { include: { menuItem: true } }, review: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.order.count({ where: { userId: session.user.id } }),
    ])

    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
}

// POST /api/orders — Create order
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    try {
        const body = await req.json()
        const { items, delivery, notes, tip, couponCode, locationId } = orderSchema.parse(body)

        // Fetch menu items and calculate totals
        const menuItemIds = items.map(i => i.menuItemId)
        const menuItems = await db.menuItem.findMany({
            where: { id: { in: menuItemIds }, active: true },
        })

        if (menuItems.length !== menuItemIds.length) {
            return NextResponse.json({ error: 'Algún plato no está disponible' }, { status: 400 })
        }

        let subtotal = 0
        const orderItems = items.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menuItemId)!
            subtotal += menuItem.price * item.quantity
            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: menuItem.price,
                notes: item.notes,
            }
        })

        // Apply coupon
        let discount = 0
        if (couponCode) {
            const coupon = await db.coupon.findFirst({
                where: { code: couponCode, active: true, expiresAt: { gte: new Date() } },
            })
            if (coupon && coupon.usedCount < coupon.maxUses) {
                discount = subtotal * (coupon.discount / 100)
                await db.coupon.update({
                    where: { id: coupon.id },
                    data: { usedCount: { increment: 1 } },
                })
            }
        }

        const total = subtotal - discount + tip

        // Generate robust order code
        const code = generateOrderCode()

        // Create order
        const order = await db.order.create({
            data: {
                code,
                userId: session.user.id,
                subtotal,
                total,
                discount,
                tip,
                delivery,
                notes,
                items: { create: orderItems },
            },
            include: { items: { include: { menuItem: true } } },
        })

        // Deduct Inventory
        const deductionItems = items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
        }))

        // Use locationId from the request body if provided, otherwise skip deduction
        if (locationId) {
            await deductStockForOrder(locationId, deductionItems)
        } else {
            console.warn('No locationId provided for order, skipping stock deduction.')
        }

        // Update user stats
        const xpEarned = Math.round(total * 10)
        const isNight = new Date().getHours() >= 22 || new Date().getHours() < 6
        const isWeekend = [0, 6].includes(new Date().getDay())

        await db.user.update({
            where: { id: session.user.id },
            data: {
                orderCount: { increment: 1 },
                totalSpent: { increment: total },
                ...(isNight ? { nightOrder: true } : {}),
                ...(isWeekend ? { weekendOrder: true } : {}),
            },
        })

        // Award XP + update streak + check badges
        const xpResult = await awardXP(session.user.id, xpEarned, 'order')
        await updateStreak(session.user.id)
        const newBadges = await checkAndAwardBadges(session.user.id)

        // Notification
        await db.notification.create({
            data: {
                userId: session.user.id,
                icon: '📦',
                title: 'Pedido Confirmado',
                message: `#${code} · ${total.toFixed(2)}€ · +${xpEarned} XP`,
            },
        })

        return NextResponse.json({
            order,
            xpEarned,
            leveledUp: xpResult.leveledUp,
            newTier: xpResult.newTier,
            newBadges,
        }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Order error:', error)
        return NextResponse.json({ error: 'Error creando pedido' }, { status: 500 })
    }
}
