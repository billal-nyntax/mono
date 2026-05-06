import { Client } from 'pg';

const TEST_DB_NAME = 'authapp_test';

export async function setup(): Promise<() => Promise<void>> {
  return async () => {
    const client = new Client({
      connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres',
    });

    try {
      await client.connect();

      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${TEST_DB_NAME}'
          AND pid <> pg_backend_pid()
      `);

      await client.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME}`);
      console.log(`Dropped test database: ${TEST_DB_NAME}`);
    } finally {
      await client.end();
    }
  };
}
