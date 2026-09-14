import { existsSync, mkdirSync } from 'node:fs';
import { paginationDatabase } from '../tests/helpers/pagination-database';

async function main() {
  mkdirSync('.seed-verification', { recursive: true });
  const file = '.seed-verification/pagination.db';
  if (existsSync(file)) throw new Error('Pagination demo DB already exists; reuse it. No records were changed.');
  const client = await paginationDatabase(file);
  await client.$disconnect();
  console.log('Created isolated pagination demo with 12 fictional disputes. Set DATABASE_URL=file:./.seed-verification/pagination.db');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
