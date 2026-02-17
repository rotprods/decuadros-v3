// ═══ SOCIAL API — Feed + Reviews ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { awardXP, checkAndAwardBadges } from '@/lib/gamification'

// GET /api/social — Feed + Reviews
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'feed' // feed | reviews | leaderboard
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    switch (type) {
        case 'feed': {
            const posts = await db.post.findMany({
                include: { user: { select: { name: true, avatar: true, tier: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            })
            const total = await db.post.count()
            return NextResponse.json({ posts, total })
        }

        case 'reviews': {
            const reviews = await db.review.findMany({
                include: {
                    user: { select: { name: true, avatar: true } },
                    order: { select: { code: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            })

            // Aggregated stats
            const stats = await db.review.aggregate({
                _avg: { rating: true },
                _count: { rating: true },
            })

            // Rating distribution
            const distribution = await Promise.all(
                [5, 4, 3, 2, 1].map(async (rating) => ({
                    rating,
                    count: await db.review.count({ where: { rating } }),
                }))
            )

            return NextResponse.json({
                reviews,
                stats: {
                    average: Math.round((stats._avg.rating || 0) * 10) / 10,
                    total: stats._count.rating,
                    distribution,
                },
            })
        }

        case 'leaderboard': {
            const users = await db.user.findMany({
                select: { id: true, name: true, avatar: true, tier: true, totalXP: true, streak: true },
                orderBy: { totalXP: 'desc' },
                take: 50,
            })
            return NextResponse.json({ leaderboard: users.map((u, i) => ({ ...u, rank: i + 1 })) })
        }

        default:
            return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
    }
}

// POST /api/social — Create post or review
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()
    const { type } = body

    try {
        switch (type) {
            case 'post': {
                const post = await db.post.create({
                    data: {
                        userId: session.user.id,
                        imageUrl: body.imageUrl || '/placeholder.jpg',
                        caption: body.caption || '',
                    },
                })
                await awardXP(session.user.id, 10, 'post')
                await checkAndAwardBadges(session.user.id)
                return NextResponse.json(post, { status: 201 })
            }

            case 'review': {
                // Verify user has an unreviewd order
                const order = await db.order.findFirst({
                    where: {
                        id: body.orderId,
                        userId: session.user.id,
                        review: null,
                        status: 'DELIVERED',
                    },
                })
                if (!order) {
                    return NextResponse.json({ error: 'Pedido no válido para reseña' }, { status: 400 })
                }

                const review = await db.review.create({
                    data: {
                        userId: session.user.id,
                        orderId: body.orderId,
                        rating: Math.min(5, Math.max(1, body.rating)),
                        text: body.text || '',
                        tags: body.tags || '',
                    },
                })
                await awardXP(session.user.id, 15, 'review')
                await checkAndAwardBadges(session.user.id)
                return NextResponse.json(review, { status: 201 })
            }

            case 'like': {
                await db.post.update({
                    where: { id: body.postId },
                    data: { likes: { increment: 1 } },
                })
                return NextResponse.json({ liked: true })
            }

            default:
                return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
        }
    } catch (error) {
        console.error('Social error:', error)
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}
