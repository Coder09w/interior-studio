import { PrismaClient } from '@prisma/client'

/**
 * Prisma client singleton.
 *
 * NOTE: A previous version of this file used `require('fs')` at the top
 * level to "fix" stale DATABASE_URL injection on certain hosting providers.
 * That workaround caused Turbopack to emit "Module not found: Can't resolve
 * 'fs'" warnings during build, and on Vercel those warnings can fail the
 * build outright because db.ts is imported (transitively) by client
 * components via plans.ts. The workaround has been removed — Vercel injects
 * DATABASE_URL correctly and doesn't need it. If you ever need to override
 * a stale system env var, do it via `vercel env` or your hosting provider's
 * env-var UI, not at runtime.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
