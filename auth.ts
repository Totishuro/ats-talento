import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient, UserRole } from "@prisma/client"

const prisma = new PrismaClient()

// @ts-ignore - Adapter type compatibility
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            // Add user role to session for authorization
            if (session.user) {
                session.user.id = user.id
                session.user.role = (user as any).role || UserRole.RECRUITER
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: "database",
    },
})
