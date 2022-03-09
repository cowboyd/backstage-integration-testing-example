import { knex, Knex } from 'knex';
import { Operation } from 'effection';
import { ConfigReader } from '@backstage/config';
import type { JsonObject } from '@backstage/types';

export function* clearTestDatabases(config: JsonObject): Operation<void> {
  const reader = new ConfigReader(config);
  const dbconfig = reader.get('backend.database');
  const prefix = reader.getString('backend.database.prefix');
  const connection = knex(dbconfig as Knex.Config);
  try {
    const result = yield connection.raw(`
SELECT datname
FROM pg_catalog.pg_database
WHERE datname LIKE '${prefix}%'
`);
    for (const row of result.rows) {
      yield connection.raw(`DROP DATABASE "${row.datname}"`);
    }
  } finally {
    yield connection.destroy();
  }
}
