import { CatalogApi } from '@backstage/catalog-client';
import { Operation } from 'effection';
import * as backstage from './support/backstage';
import * as database from './support/database';
import { createTestLog } from './support/log';

export const config = {
  backend: {
    listen: { port: 8800 },
    database: {
      prefix: "integration_tests_",
      client: 'pg',
      connection: {
        host: 'localhost',
        port: '5432',
        user: 'postgres',
        password: 'postgres',
      },
    },
    baseUrl: 'http://localhost:8800',
  }
};


export function createBackstage(): Operation<CatalogApi> {
  return {
    name: 'Backstage',
    *init() {
      yield database.clearTestDatabases(config);
      return yield backstage.createBackstage({
        config,
        log: yield createTestLog()
      });
    }
  }
}
