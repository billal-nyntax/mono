import { execSync } from 'node:child_process';
import { Client } from 'pg';

const TEST_DB_NAME = 'authapp_test';
const TEST_DATABASE_URL = `postgresql://postgres:postgres@localhost:5432/${TEST_DB_NAME}`;

export async function setup(): Promise<void> {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres',
  });

  try {
    await client.connect();

    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [TEST_DB_NAME],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${TEST_DB_NAME}`);
      console.log(`Created test database: ${TEST_DB_NAME}`);
    } else {
      console.log(`Test database already exists: ${TEST_DB_NAME}`);
    }
  } finally {
    await client.end();
  }

  process.env['DATABASE_URL'] = TEST_DATABASE_URL;

  execSync('pnpm --filter @repo/database db:migrate:deploy', {
    cwd: process.cwd().replace(/apps\/api$/, ''),
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  });

  console.log('Migrations applied to test database');
}
