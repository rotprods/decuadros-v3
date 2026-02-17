// ═══ DE CUADROS V3 — GAMIFICATION ENGINE ═══
// Server-side validated XP, levels, badges, streaks, wheel

import { db } from './db'

// ─── TIER SYSTEM ───
export const TIERS = [
    { name: 'NOVATO', min: 0, color: '#888' },
    { name: 'FOODIE', min: 200, color: '#27ae60' },
    { name: 'GOURMET', min: 500, color: '#2980b9' },
    { name: 'CHEF', min: 1000, color: '#8e44ad' },
    { name: 'MASTER CHEF', min: 2500, color: '#D4A039' },
    { name: 'REY DE CUADROS', min: 5000, color: '#e74c3c' },
] as const

export const PET_STAGES = [
    { name: 'Huevo', emoji: '🥚', evolveAt: 5, moodDecay: 2 },
    { name: 'Bebé Pulpo', emoji: '🐣', evolveAt: 15, moodDecay: 3 },
    { name: 'Pulpín', emoji: '🐙', evolveAt: 30, moodDecay: 4 },
    { name: 'Pulpo Chef', emoji: '🐙👨‍🍳', evolveAt: 50, moodDecay: 5 },
    { name: 'Kraken', emoji: '🦑', evolveAt: 80, moodDecay: 6 },
    { name: 'Leviatán', emoji: '🐉', evolveAt: null, moodDecay: 7 },
] as const

export const WHEEL_PRIZES = [
    { text: '+10 pts', reward: { type: 'points', amount: 10 } },
    { text: '+25 pts', reward: { type: 'points', amount: 25 } },
    { text: '+50 pts', reward: { type: 'points', amount: 50 } },
    { text: '+100 pts', reward: { type: 'points', amount: 100 } },
    { text: '5% OFF', reward: { type: 'coupon', discount: 5, code: '5OFF' } },
    { text: 'Postre Gratis', reward: { type: 'coupon', discount: 100, code: 'POSTRE' } },
    { text: '+5 pts', reward: { type: 'points', amount: 5 } },
    { text: 'x2 XP 1h', reward: { type: 'multiplier', duration: 3600 } },
] as const

// ─── GET TIER ───
export function getTier(points: number) {
    let tier = TIERS[0] as (typeof TIERS)[number]
    for (const t of TIERS) {
        if (points >= t.min) tier = t
    }
    return tier
}

// ─── AWARD XP ───
export async function awardXP(userId: string, amount: number, source: string) {
    const user = await db.user.update({
        where: { id: userId },
        data: {
            points: { increment: amount },
            totalXP: { increment: amount },
            seasonXP: { increment: amount },
        },
    })

    // Check level up
    const oldTier = getTier(user.points - amount)
    const newTier = getTier(user.points)
    const leveledUp = oldTier.name !== newTier.name

    if (leveledUp) {
        await db.user.update({
            where: { id: userId },
            data: { tier: newTier.name },
        })
        await db.notification.create({
            data: {
                userId,
                icon: '🎉',
                title: '¡Subiste de Nivel!',
                message: `Ahora eres ${newTier.name}`,
            },
        })
    }

    // Update season level
    const seasonLevel = Math.floor(user.seasonXP / 100)
    if (seasonLevel !== user.seasonLevel) {
        await db.user.update({
            where: { id: userId },
            data: { seasonLevel },
        })
    }

    return { user, leveledUp, newTier: newTier.name }
}

// ─── STREAK ───
export async function updateStreak(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return

    const now = new Date()
    const today = now.toDateString()
    const lastActive = user.lastActive.toDateString()

    if (lastActive === today) return // Already counted today

    const diffMs = now.getTime() - user.lastActive.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    const newStreak = diffDays <= 1.5 ? user.streak + 1 : 1
    const bestStreak = Math.max(newStreak, user.bestStreak)

    await db.user.update({
        where: { id: userId },
        data: {
            streak: newStreak,
            bestStreak,
            lastActive: now,
        },
    })

    return newStreak
}

// ─── SPIN WHEEL (Server-validated) ───
export async function spinWheel(userId: string) {
    // Check cooldown (1 hour for free, less for premium)
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const cooldownMs = user.isPremium ? 1800000 : 3600000 // 30min premium, 1h free
    const lastSpin = await db.wheelSpin.findFirst({
        where: { userId },
        orderBy: { spunAt: 'desc' },
    })

    if (lastSpin) {
        const elapsed = Date.now() - lastSpin.spunAt.getTime()
        if (elapsed < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - elapsed) / 60000)
            throw new Error(`Espera ${remaining} minutos más`)
        }
    }

    // Server-side random prize
    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length)
    const prize = WHEEL_PRIZES[prizeIndex]

    // Record spin
    await db.wheelSpin.create({
        data: { userId, prize: prize.text },
    })

    // Apply reward
    if (prize.reward.type === 'points') {
        await awardXP(userId, prize.reward.amount, 'wheel_spin')
    }

    if (prize.reward.type === 'coupon') {
        const coupon = await db.coupon.upsert({
            where: { code: prize.reward.code },
            create: {
                code: prize.reward.code,
                discount: prize.reward.discount,
                maxUses: 999,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            update: {},
        })
        await db.userCoupon.create({
            data: { userId, couponId: coupon.id },
        })
    }

    return { prizeIndex, prize: prize.text, reward: prize.reward }
}

// ─── PET ACTIONS ───
export async function petAction(userId: string, action: 'feed' | 'play') {
    const pet = await db.pet.findUnique({ where: { userId } })
    if (!pet) {
        // Create pet if doesn't exist
        return db.pet.create({
            data: { userId, name: 'Pulpi', stage: 0, mood: 80, actions: 0 },
        })
    }

    const moodGain = action === 'feed' ? 30 : 20
    const newMood = Math.min(100, pet.mood + moodGain)
    const newActions = pet.actions + 1

    // Check evolution
    const currentStage = PET_STAGES[pet.stage]
    let newStage = pet.stage
    if (currentStage && currentStage.evolveAt && newActions >= currentStage.evolveAt && pet.stage < PET_STAGES.length - 1) {
        newStage = pet.stage + 1
    }

    const updated = await db.pet.update({
        where: { userId },
        data: {
            mood: newMood,
            actions: newActions,
            stage: newStage,
            ...(action === 'feed' ? { lastFed: new Date() } : {}),
        },
    })

    const evolved = newStage !== pet.stage
    return {
        pet: updated,
        evolved,
        newStageName: evolved ? PET_STAGES[newStage].name : null,
    }
}

// ─── CHECK BADGES ───
export async function checkAndAwardBadges(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            badges: true,
            orders: true,
            pet: true,
        },
    })
    if (!user) return []

    const allBadges = await db.badge.findMany()
    const userBadgeIds = user.badges.map(b => b.badgeId)
    const newBadges: string[] = []

    for (const badge of allBadges) {
        if (userBadgeIds.includes(badge.id)) continue

        let shouldUnlock = false
        try {
            const condition = JSON.parse(badge.condition || '{}')
            switch (condition.type) {
                case 'orders': shouldUnlock = user.orderCount >= (condition.count ?? 0); break
                case 'points': shouldUnlock = user.points >= (condition.count ?? 0); break
                case 'streak': shouldUnlock = user.streak >= (condition.count ?? 0); break
                case 'games': shouldUnlock = user.gamesPlayed >= (condition.count ?? 0); break
                case 'tier': shouldUnlock = user.tier === condition.value; break
                case 'petStage': shouldUnlock = (user.pet?.stage ?? 0) >= (condition.count ?? 0); break
            }
        } catch { /* invalid condition JSON */ }

        if (shouldUnlock) {
            await db.userBadge.create({ data: { userId, badgeId: badge.id } })
            newBadges.push(badge.name)
            await db.notification.create({
                data: {
                    userId,
                    icon: badge.icon,
                    title: '🏅 Logro Desbloqueado',
                    message: badge.name,
                },
            })
        }
    }

    return newBadges
}
