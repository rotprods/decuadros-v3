import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig = {
    pages: {
        signIn: "/login",
        newUser: "/register", // Redirect updated from /onboarding
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnApp = nextUrl.pathname.startsWith('/app')
            const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')

            if (isOnApp) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn && isOnAuth) {
                return Response.redirect(new URL('/app', nextUrl))
            }
            return true
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
                // Note: DB properties (tier, points etc) must be fetched in the full auth.ts session callback
                // or here if we find a way to pass them via token without DB call on edge
                // For now, simple session in middleware is enough for protection.
            }
            return session
        },
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        // Credentials provider will be added in the full auth.ts file as it requires DB access
    ],
} satisfies NextAuthConfig
