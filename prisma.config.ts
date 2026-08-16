import 'dotenv/config';
import path from 'node:path';

import { defineConfig, env } from 'prisma/config';

/**
 * Prisma CLI configuration.
 *
 * In the Prisma 7 line, connection URLs moved out of `schema.prisma` and into
 * this file. That split is convenient here, because the project genuinely needs
 * two different connections (16_DATABASE_ARCHITECTURE):
 *
 *   DIRECT_URL    unpooled  → migrations   (declared below)
 *   DATABASE_URL  pooled    → runtime      (driver adapter, lib/db/prisma.ts)
 *
 * Migrations MUST use the direct connection. They take advisory locks and run
 * DDL, and a transaction pooler cannot carry either — pointing migrations at
 * the pooled URL produces intermittent failures that look like network flakes.
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  datasource: {
    // Migrations and introspection only. Never the pooled URL.
    url: env('DIRECT_URL'),
  },

  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
