import 'server-only';

import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
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

/**
 * Neon's driver speaks to Neon's endpoints; it cannot talk to a plain Postgres
 * on localhost. Production is Neon, but local development and integration tests
 * run against a normal Postgres container, so the adapter is chosen from the
 * connection string.
 *
 * This is a development affordance, NOT a change to the approved database
 * decision: production remains PostgreSQL on Neon (D-A3a). Both adapters speak
 * to the same engine, so the SQL, the migrations and the constraints are
 * identical either way.
 */
function isNeonConnection(connectionString: string): boolean {
  return connectionString.includes('neon.tech');
}

function createPrismaClient(): PrismaClient {
  const connectionString = serverEnv.DATABASE_URL;

  // The WebSocket pool adapter is used rather than the HTTP one because the
  // write paths need interactive transactions — a slug change must write
  // SlugHistory and update the entity atomically, or an interrupted request
  // leaves a dangling redirect.
  const adapter = isNeonConnection(connectionString)
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });

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
