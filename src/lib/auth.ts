import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import type { PlanKey } from "@/lib/plans";
import { isBetaMode } from "@/lib/plans";

// Build providers list dynamically — Google only enabled if env vars are set,
// so the app still boots fine without OAuth configured (no crash on Vercel).
const providers: NextAuthOptions["providers"] = [
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
        plan: isBetaMode() ? 'pro' : (user.plan as PlanKey),
      };
    },
  }),
];

// Enable Google OAuth only if env vars are present (graceful no-op otherwise)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // allow existing email users to sign in via Google
    })
  );
}

export const authOptions: NextAuthOptions = {
  // NOTE: PrismaAdapter is removed because it is incompatible with
  // CredentialsProvider + JWT strategy. It causes "Configuration" errors
  // and server crashes when NextAuth tries to create Account records
  // for credential-based logins. We query the User table directly in
  // the authorize() callback instead.
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: upsert user into DB so they exist for plan lookups
      if (account?.provider === 'google' && user.email) {
        try {
          const existing = await db.user.findUnique({ where: { email: user.email } });
          if (!existing) {
            // Create new user record for Google sign-in (no password — OAuth only)
            await db.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                password: '', // empty password — OAuth users can't login via credentials
                plan: isBetaMode() ? 'pro' : 'free',
              },
            });
          }
        } catch (e) {
          // If user creation fails (e.g. race condition), continue — DB lookup below handles it
          console.error('Google OAuth user upsert failed:', e);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // For Google OAuth first sign-in: fetch user from DB to get id + plan
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = await db.user.findUnique({ where: { email: user.email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name;
            token.plan = isBetaMode() ? 'pro' as PlanKey : (dbUser.plan as PlanKey);
            return token;
          }
        } catch {
          // fall through to default handling
        }
      }
      if (user) {
        // Initial sign-in (credentials): set plan from user record
        // During beta, all users get 'pro' plan in their session
        token.id = user.id;
        token.name = user.name;
        token.plan = isBetaMode()
          ? 'pro' as PlanKey
          : (user as unknown as Record<string, unknown>).plan as PlanKey;
      }

      // Refresh plan from DB on session update or periodically
      // This ensures webhook updates (plan changes) are reflected
      // in the JWT without requiring the user to log out and back in.
      if (trigger === "update" || (!user && token.id)) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { plan: true, name: true },
          });
          if (dbUser) {
            token.plan = dbUser.plan as PlanKey;
            token.name = dbUser.name;
          }
        } catch {
          // If DB query fails, keep existing token data
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.plan = token.plan as PlanKey;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

/**
 * Server-side auth helper — returns the current session (or null).
 * Usage: const session = await auth();
 */
export async function auth() {
  return getServerSession(authOptions);
}
