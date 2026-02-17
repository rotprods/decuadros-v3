// ═══ GAMIFICATION API ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { awardXP, spinWheel, petAction, checkAndAwardBadges, getTier, TIERS, PET_STAGES } from '@/lib/gamification'

// GET /api/gamification — Full user gamification profile
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            badges: { include: { badge: true } },
            missions: { include: { mission: true } },
            seasonRewards: true,
            pet: true,
            wheelSpins: { orderBy: { spunAt: 'desc' }, take: 1 },
        },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const tier = getTier(user.points)
    const nextTier = TIERS[TIERS.indexOf(tier) + 1]
    const progress = nextTier
        ? ((user.points - tier.min) / (nextTier.min - tier.min)) * 100
        : 100

    const petStage = user.pet ? PET_STAGES[user.pet.stage] : null

    // Leaderboard position
    const rank = await db.user.count({ where: { totalXP: { gt: user.totalXP } } }) + 1

    return NextResponse.json({
        profile: {
            name: user.name,
            avatar: user.avatar,
            tier: tier.name,
            tierColor: tier.color,
            points: user.points,
            totalXP: user.totalXP,
            progress,
            nextTier: nextTier?.name || null,
            nextTierMin: nextTier?.min || null,
            streak: user.streak,
            bestStreak: user.bestStreak,
            rank,
            isPremium: user.isPremium,
            subscription: user.subscription,
        },
        badges: {
            unlocked: user.badges.map(b => ({
                id: b.badge.id,
                name: b.badge.name,
                icon: b.badge.icon,
                rarity: b.badge.rarity,
                unlockedAt: b.unlockedAt,
            })),
            total: await db.badge.count(),
        },
        missions: user.missions.map(m => ({
            id: m.mission.id,
            text: m.mission.text,
            icon: m.mission.icon,
            reward: m.mission.reward,
            completed: m.completed,
        })),
        season: {
            xp: user.seasonXP,
            level: user.seasonLevel,
            nextLevelXP: (user.seasonLevel + 1) * 100,
        },
        pet: user.pet ? {
            name: user.pet.name,
            stage: user.pet.stage,
            stageName: petStage?.name,
            emoji: petStage?.emoji,
            mood: user.pet.mood,
            actions: user.pet.actions,
            nextEvolution: petStage?.evolveAt,
        } : null,
        wheel: {
            lastSpin: user.wheelSpins[0]?.spunAt || null,
            cooldownMs: user.isPremium ? 1800000 : 3600000,
        },
        stats: {
            orderCount: user.orderCount,
            totalSpent: user.totalSpent,
            gamesPlayed: user.gamesPlayed,
            arcadePoints: user.arcadePoints,
        },
    })
}

// POST /api/gamification — Perform gamification actions
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()
    const { action, data } = body

    try {
        switch (action) {
            case 'spin_wheel': {
                const result = await spinWheel(session.user.id)
                return NextResponse.json(result)
            }

            case 'pet_feed': {
                const result = await petAction(session.user.id, 'feed')
                return NextResponse.json(result)
            }

            case 'pet_play': {
                const result = await petAction(session.user.id, 'play')
                return NextResponse.json(result)
            }

            case 'claim_mission': {
                const mission = await db.userMission.findFirst({
                    where: {
                        userId: session.user.id,
                        missionId: data.missionId,
                        completed: false,
                    },
                    include: { mission: true },
                })
                if (!mission) return NextResponse.json({ error: 'Misión no encontrada' }, { status: 404 })

                await db.userMission.update({
                    where: { id: mission.id },
                    data: { completed: true, completedAt: new Date() },
                })

                const xpResult = await awardXP(session.user.id, mission.mission.reward, 'mission')
                return NextResponse.json({ claimed: true, xpEarned: mission.mission.reward, ...xpResult })
            }

            case 'game_end': {
                const { game, score } = data
                const pts = Math.round(score / 2)

                // Update high scores
                const scoreField = `${game}Best` as any
                const user = await db.user.findUnique({ where: { id: session.user.id } })
                if (user && score > (user as any)[scoreField]) {
                    await db.user.update({
                        where: { id: session.user.id },
                        data: { [scoreField]: score },
                    })
                }

                await db.user.update({
                    where: { id: session.user.id },
                    data: {
                        gamesPlayed: { increment: 1 },
                        arcadePoints: { increment: pts },
                    },
                })

                const xpResult = await awardXP(session.user.id, pts, `game_${game}`)
                const newBadges = await checkAndAwardBadges(session.user.id)
                return NextResponse.json({ arcadePoints: pts, ...xpResult, newBadges })
            }

            case 'claim_season_reward': {
                const { seasonRewardId } = data
                const existing = await db.userSeasonReward.findFirst({
                    where: { userId: session.user.id, seasonRewardId },
                })
                if (existing) return NextResponse.json({ error: 'Ya reclamado' }, { status: 400 })

                await db.userSeasonReward.create({
                    data: { userId: session.user.id, seasonRewardId },
                })

                const xpResult = await awardXP(session.user.id, 25, 'season_reward')
                return NextResponse.json({ claimed: true, ...xpResult })
            }

            default:
                return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Error' }, { status: 400 })
    }
}
