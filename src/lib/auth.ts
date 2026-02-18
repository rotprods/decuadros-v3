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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string

                // Fetch fresh user data
                const dbUser = await db.user.findUnique({
                    where: { id: token.id as string },
                    select: {
                        tier: true,
                        points: true,
                        streak: true,
                        isPremium: true,
                        subscription: true,
                        avatar: true,
                        role: true,
                    },
                })

                if (dbUser) {
                    ; (session.user as any).role = dbUser.role
                        ; (session.user as any).tier = dbUser.tier
                        ; (session.user as any).points = dbUser.points
                        ; (session.user as any).streak = dbUser.streak
                        ; (session.user as any).isPremium = dbUser.isPremium
                        ; (session.user as any).subscription = dbUser.subscription
                        ; (session.user as any).avatar = dbUser.avatar
                }
            }
            return session
        },
    },
})
