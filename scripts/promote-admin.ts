const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error("Please provide an email: npx ts-node scripts/promote-admin.ts user@example.com")
        process.exit(1)
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        })
        console.log(`✅ ¡Éxito! El usuario ${user.email} ahora es ADMIN ("El Jefe").`)
    } catch (e) {
        console.error("❌ Error al actualizar usuario:", e)
    }
}

main()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
