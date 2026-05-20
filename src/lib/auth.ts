import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

export const authOptions = {
  // NOTE: PrismaAdapter is removed because it is incompatible with
  // CredentialsProvider + JWT strategy. It causes "Configuration" errors
  // and server crashes when NextAuth tries to create Account records
  // for credential-based logins. We query the User table directly in
  // the authorize() callback instead.
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: Record<string, unknown> }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.plan = user.plan as string;
      }
      return token;
    },
    async session({ session, token }: { session: Record<string, unknown>; token: Record<string, unknown> }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).name = token.name;
        (session.user as Record<string, unknown>).plan = token.plan;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} as const;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

/**
 * Server-side auth helper — returns the current session (or null).
 * Usage: const session = await auth();
 */
export async function auth() {
  return getServerSession(authOptions as any);
}
