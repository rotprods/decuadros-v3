// ═══ DE CUADROS V3 — SEED DATA ═══
// Migrated from V2 app1.js constants
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding De Cuadros V3...')

    // ─── CATEGORIES ───
    const cats = await Promise.all([
        prisma.category.upsert({ where: { name: 'entrantes' }, update: {}, create: { name: 'entrantes', icon: '🥗', sortOrder: 0 } }),
        prisma.category.upsert({ where: { name: 'principales' }, update: {}, create: { name: 'principales', icon: '🍽️', sortOrder: 1 } }),
        prisma.category.upsert({ where: { name: 'postres' }, update: {}, create: { name: 'postres', icon: '🍰', sortOrder: 2 } }),
        prisma.category.upsert({ where: { name: 'bebidas' }, update: {}, create: { name: 'bebidas', icon: '🍷', sortOrder: 3 } }),
        prisma.category.upsert({ where: { name: 'especiales' }, update: {}, create: { name: 'especiales', icon: '⭐', sortOrder: 4 } }),
    ])

    console.log('✅ Categories:', cats.length)

    // ─── MENU ITEMS ───
    const menuData = [
        { name: 'Baozi de Cerdo Ibérico', price: 7.50, cat: 'entrantes', desc: 'Bollitos al vapor rellenos de cerdo ibérico con salsa hoisin casera', badge: '🔥 TOP', nutrition: '320 kcal', allergens: 'Gluten, Soja' },
        { name: 'Gyozas de Rabo de Toro', price: 9.90, cat: 'entrantes', desc: 'Empanadillas japonesas con relleno de rabo de toro guisado', badge: 'NUEVO', nutrition: '280 kcal', allergens: 'Gluten, Huevo' },
        { name: 'Tartar de Atún Rojo', price: 13.90, cat: 'entrantes', desc: 'Atún rojo de almadraba con aguacate, sésamo y ponzu', badge: '🔥 TOP', nutrition: '250 kcal', allergens: 'Pescado, Sésamo' },
        { name: 'Croquetas de Cochinillo', price: 8.50, cat: 'entrantes', desc: 'Croquetas cremosas de cochinillo confitado', nutrition: '350 kcal', allergens: 'Gluten, Lácteos' },
        { name: 'Pulpo con Orzo Trufado', price: 16.90, cat: 'principales', desc: 'Pulpo a la brasa sobre orzo cremoso con aceite de trufa negra', badge: '⭐ CHEF', nutrition: '520 kcal', allergens: 'Moluscos, Gluten' },
        { name: 'Pizza Fusión Ibérica', price: 12.90, cat: 'principales', desc: 'Base sourdough con mozzarella di bufala, jamón ibérico y reducción Pedro Ximénez', nutrition: '680 kcal', allergens: 'Gluten, Lácteos' },
        { name: 'Ramen de Cochinillo', price: 14.50, cat: 'principales', desc: 'Caldo tonkotsu de 24h con cochinillo confitado, huevo 63° y nori', badge: 'NUEVO', nutrition: '750 kcal', allergens: 'Gluten, Huevo, Soja' },
        { name: 'Gnocchi Trufados', price: 13.90, cat: 'principales', desc: 'Gnocchi caseros con crema de parmesano y trufa negra rallada', nutrition: '620 kcal', allergens: 'Gluten, Lácteos, Huevo' },
        { name: 'Solomillo Wellington', price: 22.90, cat: 'especiales', desc: 'Solomillo envuelto en hojaldre con duxelles de champiñones y foie', badge: '⭐ CHEF', nutrition: '850 kcal', allergens: 'Gluten, Lácteos, Huevo' },
        { name: 'Tataki de Wagyu', price: 28.90, cat: 'especiales', desc: 'Wagyu A5 sellado con ponzu de yuzu y brotes frescos', nutrition: '480 kcal', allergens: 'Soja' },
        { name: 'Cheesecake Yuzu', price: 7.50, cat: 'postres', desc: 'Tarta de queso japonesa con coulis de yuzu y mochi', nutrition: '380 kcal', allergens: 'Lácteos, Gluten, Huevo' },
        { name: 'Coulant de Chocolate', price: 8.90, cat: 'postres', desc: 'Bizcocho volcánico con helado de vainilla bourbon', badge: '🔥 TOP', nutrition: '450 kcal', allergens: 'Lácteos, Gluten, Huevo' },
        { name: 'Sangría Premium', price: 6.90, cat: 'bebidas', desc: 'Vino tinto con frutas frescas, ron y especias', nutrition: '180 kcal', allergens: 'Sulfitos' },
        { name: 'Mojito de Lychee', price: 7.90, cat: 'bebidas', desc: 'Ron premium con lychee fresco, lima y hierbabuena', nutrition: '200 kcal', allergens: '' },
        { name: 'Matcha Latte', price: 4.50, cat: 'bebidas', desc: 'Matcha ceremonial con leche de avena y miel', nutrition: '140 kcal', allergens: 'Lácteos' },
    ]

    for (const item of menuData) {
        const cat = cats.find(c => c.name === item.cat)
        if (!cat) continue
        await prisma.menuItem.upsert({
            where: { id: item.name.toLowerCase().replace(/ /g, '-') },
            update: {},
            create: {
                id: item.name.toLowerCase().replace(/ /g, '-'),
                name: item.name,
                description: item.desc,
                price: item.price,
                badge: item.badge || null,
                nutrition: item.nutrition,
                allergens: item.allergens,
                categoryId: cat.id,
                image: `/menu/${item.name.toLowerCase().replace(/ /g, '-')}.jpg`,
            },
        })
    }
    console.log('✅ Menu items:', menuData.length)

    // ─── BADGES (50) ───
    const badgeData = [
        // General (10)
        { name: 'Primer Bocado', icon: '🍽️', rarity: 'common', category: 'food', condition: '{"type":"orders","count":1}' },
        { name: 'Foodie Inicial', icon: '🌟', rarity: 'common', category: 'food', condition: '{"type":"orders","count":3}' },
        { name: 'Gourmet', icon: '🎩', rarity: 'uncommon', category: 'food', condition: '{"type":"orders","count":10}' },
        { name: 'Adicto al Sabor', icon: '🔥', rarity: 'rare', category: 'food', condition: '{"type":"orders","count":25}' },
        { name: 'Rey del Menú', icon: '👑', rarity: 'epic', category: 'food', condition: '{"type":"orders","count":50}' },
        { name: 'Leyenda Fusión', icon: '🐉', rarity: 'legendary', category: 'food', condition: '{"type":"orders","count":100}' },
        // Points (8)
        { name: 'Primer Punto', icon: '⭐', rarity: 'common', category: 'general', condition: '{"type":"points","count":10}' },
        { name: 'Centenario', icon: '💯', rarity: 'uncommon', category: 'general', condition: '{"type":"points","count":100}' },
        { name: 'Medio Millar', icon: '🏅', rarity: 'rare', category: 'general', condition: '{"type":"points","count":500}' },
        { name: 'Mil Puntos', icon: '🏆', rarity: 'epic', category: 'general', condition: '{"type":"points","count":1000}' },
        { name: 'Cinco Mil', icon: '💎', rarity: 'legendary', category: 'general', condition: '{"type":"points","count":5000}' },
        // Streak (7)
        { name: 'Día 1', icon: '🔥', rarity: 'common', category: 'streak', condition: '{"type":"streak","count":1}' },
        { name: 'Racha de 3', icon: '🔥🔥', rarity: 'common', category: 'streak', condition: '{"type":"streak","count":3}' },
        { name: 'Racha Semanal', icon: '🗓️', rarity: 'uncommon', category: 'streak', condition: '{"type":"streak","count":7}' },
        { name: 'Dos Semanas', icon: '💪', rarity: 'rare', category: 'streak', condition: '{"type":"streak","count":14}' },
        { name: 'Racha Mensual', icon: '🌟', rarity: 'epic', category: 'streak', condition: '{"type":"streak","count":30}' },
        { name: 'Racha Legendaria', icon: '🐉', rarity: 'legendary', category: 'streak', condition: '{"type":"streak","count":60}' },
        { name: 'Racha Inmortal', icon: '♾️', rarity: 'legendary', category: 'streak', condition: '{"type":"streak","count":100}' },
        // Arcade (8)
        { name: 'Primera Partida', icon: '🎮', rarity: 'common', category: 'arcade', condition: '{"type":"games","count":1}' },
        { name: 'Jugador', icon: '🕹️', rarity: 'common', category: 'arcade', condition: '{"type":"games","count":5}' },
        { name: 'Gamer', icon: '👾', rarity: 'uncommon', category: 'arcade', condition: '{"type":"games","count":15}' },
        { name: 'Pro Gamer', icon: '🏆', rarity: 'rare', category: 'arcade', condition: '{"type":"games","count":30}' },
        { name: 'Arcade King', icon: '👑', rarity: 'epic', category: 'arcade', condition: '{"type":"games","count":50}' },
        { name: 'Esports Legend', icon: '⚡', rarity: 'legendary', category: 'arcade', condition: '{"type":"games","count":100}' },
        // Social (7)
        { name: 'Primera Foto', icon: '📸', rarity: 'common', category: 'social', condition: '{"type":"posts","count":1}' },
        { name: 'Influencer', icon: '📱', rarity: 'uncommon', category: 'social', condition: '{"type":"posts","count":5}' },
        { name: 'Fotógrafo', icon: '📷', rarity: 'rare', category: 'social', condition: '{"type":"posts","count":15}' },
        { name: 'Crítico', icon: '✍️', rarity: 'uncommon', category: 'social', condition: '{"type":"reviews","count":3}' },
        { name: 'Gran Crítico', icon: '🌟', rarity: 'epic', category: 'social', condition: '{"type":"reviews","count":10}' },
        // Tier (5)
        { name: 'Foodie Tier', icon: '🥉', rarity: 'uncommon', category: 'general', condition: '{"type":"tier","value":"FOODIE"}' },
        { name: 'Gourmet Tier', icon: '🥈', rarity: 'rare', category: 'general', condition: '{"type":"tier","value":"GOURMET"}' },
        { name: 'Chef Tier', icon: '🥇', rarity: 'epic', category: 'general', condition: '{"type":"tier","value":"CHEF"}' },
        { name: 'Master Chef Tier', icon: '🏆', rarity: 'epic', category: 'general', condition: '{"type":"tier","value":"MASTER CHEF"}' },
        { name: 'Rey de Cuadros Tier', icon: '👑', rarity: 'legendary', category: 'general', condition: '{"type":"tier","value":"REY DE CUADROS"}' },
        // Pet (5)
        { name: 'Padre de Pulpo', icon: '🥚', rarity: 'common', category: 'general', condition: '{"type":"petStage","count":1}' },
        { name: 'Pulpín Feliz', icon: '🐙', rarity: 'uncommon', category: 'general', condition: '{"type":"petStage","count":2}' },
        { name: 'Chef Pulpo', icon: '👨‍🍳', rarity: 'rare', category: 'general', condition: '{"type":"petStage","count":3}' },
        { name: 'Kraken', icon: '🦑', rarity: 'epic', category: 'general', condition: '{"type":"petStage","count":4}' },
        { name: 'Leviatán', icon: '🐉', rarity: 'legendary', category: 'general', condition: '{"type":"petStage","count":5}' },
    ]

    for (const badge of badgeData) {
        await prisma.badge.upsert({
            where: { name: badge.name },
            update: {},
            create: badge,
        })
    }
    console.log('✅ Badges:', badgeData.length)

    // ─── MISSIONS ───
    const missionData = [
        { text: 'Ve la carta completa', icon: '📋', reward: 15, type: 'daily', condition: '{"type":"view","target":"menu"}' },
        { text: 'Juega 1 partida', icon: '🎮', reward: 20, type: 'daily', condition: '{"type":"games","count":1}' },
        { text: 'Dale like a 1 foto', icon: '❤️', reward: 10, type: 'daily', condition: '{"type":"likes","count":1}' },
        { text: 'Gira la ruleta', icon: '🎰', reward: 10, type: 'daily', condition: '{"type":"wheel","count":1}' },
        { text: 'Abre la app', icon: '📱', reward: 5, type: 'daily', condition: '{"type":"login"}' },
        { text: 'Alimenta a tu mascota', icon: '🐙', reward: 15, type: 'daily', condition: '{"type":"pet","action":"feed"}' },
        { text: 'Haz un pedido', icon: '🍽️', reward: 50, type: 'daily', condition: '{"type":"orders","count":1}' },
        { text: 'Comparte 1 foto', icon: '📸', reward: 25, type: 'daily', condition: '{"type":"posts","count":1}' },
    ]

    for (const mission of missionData) {
        await prisma.mission.upsert({
            where: { id: mission.text.toLowerCase().replace(/ /g, '-') },
            update: {},
            create: {
                id: mission.text.toLowerCase().replace(/ /g, '-'),
                ...mission,
            },
        })
    }
    console.log('✅ Missions:', missionData.length)

    // ─── SEASON ───
    const season = await prisma.season.upsert({
        where: { id: 'season-1' },
        update: {},
        create: {
            id: 'season-1',
            name: 'Temporada 1: Fusión Primavera',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-04-01'),
            active: true,
        },
    })

    const seasonRewards = [
        { level: 1, free: '+10 pts', premium: 'Skin: Pulpo Dorado' },
        { level: 3, free: '+25 pts', premium: 'Cupón 5% OFF' },
        { level: 5, free: 'Giro Extra', premium: 'x2 XP 24h' },
        { level: 7, free: '+50 pts', premium: 'Skin: Pulpo Samurai' },
        { level: 10, free: '+100 pts', premium: 'Postre Gratis + Skin Legendaria' },
    ]

    for (const reward of seasonRewards) {
        await prisma.seasonReward.upsert({
            where: { seasonId_level: { seasonId: season.id, level: reward.level } },
            update: {},
            create: {
                seasonId: season.id,
                level: reward.level,
                freeReward: reward.free,
                premiumReward: reward.premium,
            },
        })
    }
    console.log('✅ Season rewards:', seasonRewards.length)

    // ─── INFOPRODUCTS ───
    const infoproducts = [
        { name: 'Muestra Gratis', price: 0, tier: 'free', bonusPoints: 0, description: '3 recetas de degustación + tips básicos' },
        { name: 'Recetario Mini', price: 4.99, tier: 'mini', bonusPoints: 0, description: '10 recetas estrella + guía fusión básica + 3 vídeos' },
        { name: 'Recetario Completo', price: 14.99, tier: 'full', bonusPoints: 200, description: '30+ recetas + todos los vídeos + actualizaciones + 200 pts bonus' },
    ]

    for (const ip of infoproducts) {
        await prisma.infoproduct.upsert({
            where: { id: ip.tier },
            update: {},
            create: { id: ip.tier, ...ip },
        })
    }
    console.log('✅ Infoproducts:', infoproducts.length)

    // ─── DEFAULT COUPONS ───
    await prisma.coupon.upsert({
        where: { code: 'BIENVENIDO' },
        update: {},
        create: { code: 'BIENVENIDO', discount: 10, maxUses: 1000, expiresAt: new Date('2027-01-01') },
    })
    await prisma.coupon.upsert({
        where: { code: 'DECUADROS20' },
        update: {},
        create: { code: 'DECUADROS20', discount: 20, maxUses: 100, expiresAt: new Date('2026-06-01') },
    })
    console.log('✅ Coupons: 2')

    // ─── DEMO USER ───
    const hashedPassword = await bcrypt.hash('demo123', 10)
    await prisma.user.upsert({
        where: { email: 'demo@decuadros.es' },
        update: {},
        create: {
            email: 'demo@decuadros.es',
            name: 'Demo User',
            hashedPassword,
            avatar: '😎',
            points: 150,
            totalXP: 150,
            tier: 'NOVATO',
            streak: 3,
            referralCode: 'DC-DEMO-2026',
        },
    })
    console.log('✅ Demo user created (demo@decuadros.es / demo123)')

    console.log('\n🎉 Seed complete!')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
