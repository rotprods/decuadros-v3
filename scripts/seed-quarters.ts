const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding The Quarters...')

    // 1. Create Default Location
    // We use a fixed ID 'hq' to make it easy to reference
    const hq = await prisma.location.upsert({
        where: { id: 'hq' },
        update: {},
        create: {
            id: 'hq',
            name: 'HQ - El Despacho',
            address: 'Calle Secreta 123',
            tables: 10,
        }
    })
    console.log(`✅ Location created: ${hq.name}`)

    // 2. Create Basic Inventory
    // Check if items exist to avoid duplicates if run multiple times without cleanup
    const count = await prisma.inventoryItem.count()
    if (count === 0) {
        const ingredients = [
            { name: 'Carne Picada Vacuno', unit: 'kg', cost: 8.50, quantity: 20, minStock: 5 },
            { name: 'Pan Brioche Artesano', unit: 'unidades', cost: 0.45, quantity: 100, minStock: 20 },
            { name: 'Queso Cheddar Vintage', unit: 'lonchas', cost: 0.15, quantity: 200, minStock: 50 },
            { name: 'Bacon Ahumado', unit: 'kg', cost: 9.00, quantity: 10, minStock: 2 },
            { name: 'Salsa Quarters', unit: 'L', cost: 3.50, quantity: 5, minStock: 1 },
            { name: 'Patatas Agria', unit: 'kg', cost: 1.20, quantity: 100, minStock: 20 },
        ]

        for (const ing of ingredients) {
            await prisma.inventoryItem.create({
                data: {
                    locationId: hq.id,
                    ...ing
                }
            })
        }
        console.log(`✅ Inventory seeded with ${ingredients.length} items`)
    } else {
        console.log('ℹ️ Inventory already has items, skipping seed.')
    }

    console.log('✅ Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
