// ═══ DE CUADROS V3 — NEXTAUTH CONFIG ═══
import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(db) as any,
    session: { strategy: 'jwt' },
    providers: [
        ...authConfig.providers,
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user || !user.hashedPassword) return null

                const valid = await bcrypt.compare(
                    credentials.password as string,
                    user.hashedPassword
                )

                if (!valid) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
            }

            // On sign in or update, fetch visible user data
            if (user || trigger === "update") {
                const userId = (token.id as string) || (user?.id as string)
                if (userId) {
                    const dbUser = await db.user.findUnique({
                        where: { id: userId },
                        select: {
                            tier: true,
                            points: true,
                            streak: true,
                            isPremium: true,
                            subscription: true,
                            avatar: true,
                            role: true,
                        }
                    })
                    if (dbUser) {
                        token.role = dbUser.role
                        token.tier = dbUser.tier
                        token.points = dbUser.points
                        token.streak = dbUser.streak
                        token.isPremium = dbUser.isPremium
                        token.subscription = dbUser.subscription
                        token.avatar = dbUser.avatar
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
                    ; (session.user as any).role = token.role
                    ; (session.user as any).tier = token.tier
                    ; (session.user as any).points = token.points
                    ; (session.user as any).streak = token.streak
                    ; (session.user as any).isPremium = token.isPremium
                    ; (session.user as any).subscription = token.subscription
                    ; (session.user as any).avatar = token.avatar
            }
            return session
        },
    },
})
