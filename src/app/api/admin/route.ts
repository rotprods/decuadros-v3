// ═══ ADMIN API — Dashboard Data ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin — Dashboard analytics
export async function GET(req: NextRequest) {
    // TODO: Add admin role check
    const { searchParams } = new URL(req.url)
    const section = searchParams.get('section') || 'dashboard'

    switch (section) {
        case 'dashboard': {
            const [totalUsers, totalOrders, totalRevenue, activeUsers] = await Promise.all([
                db.user.count(),
                db.order.count(),
                db.order.aggregate({ _sum: { total: true } }),
                db.user.count({ where: { lastActive: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
            ])

            // Recent orders
            const recentOrders = await db.order.findMany({
                include: { user: { select: { name: true, avatar: true } }, items: { include: { menuItem: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
            })

            // Top items
            const topItems = await db.orderItem.groupBy({
                by: ['menuItemId'],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5,
            })

            const topItemDetails = await Promise.all(
                topItems.map(async (t) => {
                    const item = await db.menuItem.findUnique({ where: { id: t.menuItemId } })
                    return { name: item?.name, totalSold: t._sum.quantity }
                })
            )

            // Subscription stats
            const [proCount, kingCount] = await Promise.all([
                db.user.count({ where: { subscription: 'pro' } }),
                db.user.count({ where: { subscription: 'king' } }),
            ])

            // Review stats
            const reviewStats = await db.review.aggregate({
                _avg: { rating: true },
                _count: { rating: true },
            })

            return NextResponse.json({
                stats: {
                    totalUsers,
                    totalOrders,
                    totalRevenue: totalRevenue._sum.total || 0,
                    activeUsers,
                    avgRating: Math.round((reviewStats._avg.rating || 0) * 10) / 10,
                    totalReviews: reviewStats._count.rating,
                    subscriptions: { pro: proCount, king: kingCount },
                    mrr: (proCount * 4.99 + kingCount * 9.99).toFixed(2),
                },
                recentOrders,
                topItems: topItemDetails,
            })
        }

        case 'orders': {
            const status = searchParams.get('status')
            const where: any = {}
            if (status) where.status = status

            const orders = await db.order.findMany({
                where,
                include: {
                    user: { select: { name: true, avatar: true, email: true } },
                    items: { include: { menuItem: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            })
            return NextResponse.json({ orders })
        }

        case 'users': {
            const users = await db.user.findMany({
                select: {
                    id: true, name: true, email: true, avatar: true,
                    tier: true, points: true, totalXP: true, streak: true,
                    orderCount: true, totalSpent: true, subscription: true,
                    createdAt: true, lastActive: true,
                },
                orderBy: { totalXP: 'desc' },
                take: 100,
            })
            return NextResponse.json({ users })
        }

        case 'menu': {
            const items = await db.menuItem.findMany({
                include: { category: true },
                orderBy: { category: { sortOrder: 'asc' } },
            })
            const categories = await db.category.findMany({ orderBy: { sortOrder: 'asc' } })
            return NextResponse.json({ items, categories })
        }

        default:
            return NextResponse.json({ error: 'Sección no válida' }, { status: 400 })
    }
}

// POST /api/admin — Admin actions (update orders, menu items, etc.)
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { action } = body

    try {
        switch (action) {
            case 'update_order_status': {
                const order = await db.order.update({
                    where: { id: body.orderId },
                    data: { status: body.status },
                })

                // Notify user
                const statusMessages: Record<string, string> = {
                    CONFIRMED: '✅ Pedido confirmado',
                    PREPARING: '👨‍🍳 Preparando tu pedido',
                    READY: '🔔 ¡Tu pedido está listo!',
                    DELIVERING: '🛵 Pedido en camino',
                    DELIVERED: '📦 Pedido entregado',
                    CANCELLED: '❌ Pedido cancelado',
                }

                await db.notification.create({
                    data: {
                        userId: order.userId,
                        icon: '📦',
                        title: 'Actualización de Pedido',
                        message: `#${order.code}: ${statusMessages[body.status] || body.status}`,
                    },
                })

                return NextResponse.json(order)
            }

            case 'toggle_menu_item': {
                const item = await db.menuItem.update({
                    where: { id: body.itemId },
                    data: { active: body.active },
                })
                return NextResponse.json(item)
            }

            case 'update_menu_item': {
                const item = await db.menuItem.update({
                    where: { id: body.itemId },
                    data: {
                        name: body.name,
                        description: body.description,
                        price: body.price,
                        badge: body.badge,
                        allergens: body.allergens,
                    },
                })
                return NextResponse.json(item)
            }

            default:
                return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
        }
    } catch (error) {
        console.error('Admin error:', error)
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}
