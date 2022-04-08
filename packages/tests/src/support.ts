import { CatalogApi } from '@backstage/catalog-client';
import { merge } from 'lodash';
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


export function createBackstage(ext: Partial<typeof config> = {}): Operation<CatalogApi> {
  return {
    name: 'Backstage',
    *init() {
      yield database.clearTestDatabases(merge(config, ext));
      return yield backstage.createBackstage({
        config: merge(config, ext),
        log: yield createTestLog()
      });
    }
  }
}
