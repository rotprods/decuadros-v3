// ═══ PAYMENTS API — Stripe Integration ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { awardXP } from '@/lib/gamification'
import Stripe from 'stripe'

function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
    return new Stripe(key, { apiVersion: '2025-01-27.acacia' as any })
}

// POST /api/payments — Create payment intent or manage subscriptions
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()
    const { action } = body

    try {
        switch (action) {
            case 'create_order_intent': {
                // Create payment intent for an order
                const order = await db.order.findFirst({
                    where: { id: body.orderId, userId: session.user.id, paymentStatus: 'PENDING' },
                })
                if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

                const paymentIntent = await getStripe().paymentIntents.create({
                    amount: Math.round(order.total * 100), // cents
                    currency: 'eur',
                    metadata: { orderId: order.id, userId: session.user.id },
                })

                await db.order.update({
                    where: { id: order.id },
                    data: { stripePaymentId: paymentIntent.id },
                })

                return NextResponse.json({
                    clientSecret: paymentIntent.client_secret,
                    amount: order.total,
                })
            }

            case 'subscribe': {
                const { plan } = body // 'pro' or 'king'
                const prices: Record<string, number> = { pro: 499, king: 999 } // cents
                const price = prices[plan]
                if (!price) return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })

                // In production, you'd create a Stripe Subscription
                // For now, simulate subscription activation
                await db.user.update({
                    where: { id: session.user.id },
                    data: {
                        subscription: plan,
                        isPremium: true,
                    },
                })

                await db.notification.create({
                    data: {
                        userId: session.user.id,
                        icon: plan === 'king' ? '👑' : '⭐',
                        title: `¡Suscrito a ${plan === 'king' ? 'Rey de Cuadros' : 'De Cuadros PRO'}!`,
                        message: 'Disfruta de todas las ventajas premium.',
                    },
                })

                return NextResponse.json({ subscription: plan, active: true })
            }

            case 'buy_infoproduct': {
                const infoproduct = await db.infoproduct.findUnique({
                    where: { id: body.infoproductId },
                })
                if (!infoproduct) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

                // Record purchase
                await db.infproductPurchase.create({
                    data: {
                        userId: session.user.id,
                        infoproductId: infoproduct.id,
                        amount: infoproduct.price,
                    },
                })

                // Award bonus points if applicable
                if (infoproduct.bonusPoints > 0) {
                    await awardXP(session.user.id, infoproduct.bonusPoints, 'infoproduct')
                }

                return NextResponse.json({
                    purchased: true,
                    downloadUrl: infoproduct.downloadUrl || '/downloads/' + infoproduct.tier + '.pdf',
                    bonusPoints: infoproduct.bonusPoints,
                })
            }

            default:
                return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
        }
    } catch (error: any) {
        console.error('Payment error:', error)
        return NextResponse.json({ error: error.message || 'Error de pago' }, { status: 500 })
    }
}

// GET /api/payments — User's payment history
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { subscription: true, isPremium: true },
    })

    const purchases = await db.infproductPurchase.findMany({
        where: { userId: session.user.id },
        include: { infoproduct: true },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
        subscription: user?.subscription,
        isPremium: user?.isPremium,
        purchases,
    })
}
