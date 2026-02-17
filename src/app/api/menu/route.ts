// ═══ MENU API ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/menu — List all menu items (with filters)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const active = searchParams.get('active') !== 'false'

    const where: any = { active }
    if (category && category !== 'todos') {
        where.category = { name: category }
    }
    if (search) {
        where.name = { contains: search, mode: 'insensitive' }
    }

    const items = await db.menuItem.findMany({
        where,
        include: { category: { select: { name: true, icon: true } } },
        orderBy: { category: { sortOrder: 'asc' } },
    })

    const categories = await db.category.findMany({ orderBy: { sortOrder: 'asc' } })

    return NextResponse.json({ items, categories })
}

// POST /api/menu — Create item (admin only)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const item = await db.menuItem.create({
            data: {
                name: body.name,
                description: body.description || '',
                price: body.price,
                image: body.image || '/placeholder.jpg',
                badge: body.badge || null,
                nutrition: body.nutrition || '',
                allergens: body.allergens || '',
                categoryId: body.categoryId,
            },
        })
        return NextResponse.json(item, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Error creating menu item' }, { status: 500 })
    }
}
