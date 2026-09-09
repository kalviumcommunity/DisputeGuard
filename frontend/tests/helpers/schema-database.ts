import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../lib/generated/prisma/client';

// Never reads DATABASE_URL: this test cannot migrate an existing user database.
export async function withSchemaDatabase<T>(run: (client: PrismaClient) => Promise<T>) {
  const db = await PGlite.create();
  // Allow replacement sockets while pg closes a connection after a rejected query.
  const server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0, maxConnections: 8 });
  let client: PrismaClient | undefined;
  try {
    const migrations = path.join(process.cwd(), 'prisma/migrations');
    for (const entry of (await readdir(migrations, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory()) await db.exec(await readFile(path.join(migrations, entry.name, 'migration.sql'), 'utf8'));
    }
    await server.start();
    const connectionString = `postgresql://postgres:postgres@${server.getServerConn()}/postgres`;
    client = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 1 }) });
    return await run(client);
  } finally {
    await client?.$disconnect();
    await server.stop();
    await db.close();
  }
}
