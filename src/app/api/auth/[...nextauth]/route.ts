import NextAuth, { type AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        console.log("🔐 Auth attempt started");
        console.log("📝 Credentials received:", { 
          username: credentials?.username, 
          hasPassword: !!credentials?.password 
        });

        if (!credentials?.username || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          console.log("👤 User lookup result:", {
            found: !!user,
            username: user?.username,
            hasPassword: !!user?.password
          });

          if (!user) {
            console.log("❌ User not found");
            return null;
          }

          const isValid = credentials.password === user.password;

          console.log("🔑 Password validation:", isValid);

          if (!isValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("✅ Authentication successful");
          // Return the complete user object
          return {
            id: user.id,
            name: user.name || user.username,
            username: user.username,
          };
        } catch (error) {
          console.error("💥 Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Add username to the token on sign in
      if (user) {
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Add username to the session
      if (session.user) {
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
} satisfies AuthOptions;

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };