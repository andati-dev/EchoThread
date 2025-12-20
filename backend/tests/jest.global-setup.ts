import { execSync } from 'child_process';
import fs from 'fs';

export default async function globalSetup() {
  // For tests we will use a local sqlite file to avoid needing Postgres in CI/local dev
  process.env.DATABASE_URL = 'file:./test.db'
  // ensure prisma client generated
  // remove old db file if exists
  try { fs.unlinkSync('./test.db') } catch (e) {}

  try {
    execSync('npx prisma generate --schema=prisma/schema.test.prisma', { stdio: 'inherit' })
    // push schema to sqlite test DB
    execSync('npx prisma db push --schema=prisma/schema.test.prisma', { stdio: 'inherit' })
  } catch (err) {
    console.error('Error running prisma for tests', err)
    throw err
  }

  // set DATABASE_URL for runtime (point to sqlite test db file)
  process.env.DATABASE_URL = 'file:./test.db'
}
