import assert from 'assert/strict';
import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Duration } from 'luxon';
import { LdapOrgEntityProvider } from '@backstage/plugin-catalog-backend-module-ldap';

import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = CatalogBuilder.create(env);
  builder.setProcessingIntervalSeconds(10);

  const id = 'our-ldap';
  const provider = env.config.getConfigArray('ldap.providers').find(config => config.get('id') === id);
  assert(provider, `no ldap provider with id = '${id}' in ldap.providers`);

  builder.addEntityProvider(
    LdapOrgEntityProvider.fromConfig(env.config, {
      id: 'our-ldap',
      target: provider.getString('target'),
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: Duration.fromObject({ minutes: 60 }),
        timeout: Duration.fromObject({ minutes: 15 }),
      }),
    }),
  );

  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
