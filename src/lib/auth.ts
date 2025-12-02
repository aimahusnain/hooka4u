import { PrismaClient } from "@prisma/client"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Find user by username
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })

        // Check plain-text password
        if (!user || user.password !== credentials.password) {
          throw new Error("Invalid credentials")
        }

        // Return user info, including role
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      username?: string | null
      role?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string | null
    role?: string | null
  }
}
