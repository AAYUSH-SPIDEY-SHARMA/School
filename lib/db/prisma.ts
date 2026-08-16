import 'server-only';

import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

import { serverEnv } from '@/lib/env';

/**
 * The Prisma client singleton.
 *
 * ⚠️ Nothing outside `lib/queries` and `lib/actions` may import this module.
 * Components never touch the ORM directly. That rule is what makes the
 * soft-delete filter and the authorisation check impossible to forget — it is
 * the single most important structural rule in the codebase
 * (BLUEPRINT/15_BACKEND_ARCHITECTURE, BLUEPRINT/36_PROJECT_STRUCTURE).
 *
 * `server-only` above turns a mistaken client import into a build error rather
 * than a runtime data leak.
 *
 * Connection choice: this uses DATABASE_URL, the POOLED Neon connection.
 * Migrations use DIRECT_URL via prisma.config.ts. Using the direct connection
 * for runtime traffic exhausts Postgres connection slots under serverless
 * concurrency; using the pooled connection for migrations breaks DDL locking.
 * They are not interchangeable.
 */

function createPrismaClient(): PrismaClient {
  // The WebSocket pool adapter is used rather than the HTTP one because the
  // write paths need interactive transactions — a slug change must write
  // SlugHistory and update the entity atomically, or an interrupted request
  // leaves a dangling redirect.
  const adapter = new PrismaNeon({
    connectionString: serverEnv.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });
}

/**
 * In development, Next.js clears the module registry on each hot reload, which
 * would otherwise create a new pool on every save until Postgres refuses new
 * connections. Stashing the client on `globalThis` survives the reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
