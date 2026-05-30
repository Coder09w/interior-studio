import { PrismaClient } from '@prisma/client'

/**
 * Fix for hosting environments that inject a stale DATABASE_URL into process.env.
 * Next.js / dotenv won't override existing env vars, so if the system env has
 * a SQLite URL but .env has the PostgreSQL URL, we read .env directly and override.
 */
if (process.env.DATABASE_URL?.startsWith('file:')) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      const match = envContent.match(/^DATABASE_URL=(.+)$/m)
      if (match?.[1] && !match[1].startsWith('file:')) {
        process.env.DATABASE_URL = match[1].trim()
      }
    }
  } catch {
    // Fall through to existing env var
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
