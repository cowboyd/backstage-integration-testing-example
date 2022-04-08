import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { LdapOrgReaderProcessor, defaultUserTransformer } from '@backstage/plugin-catalog-backend-module-ldap';
import { merge } from 'lodash';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = CatalogBuilder.create(env);
  builder.setProcessingIntervalSeconds(10);

  builder.addProcessor(
    LdapOrgReaderProcessor.fromConfig(env.config, {
      logger: env.logger,
      async userTransformer(vendor, config, entry) {
        let user = await defaultUserTransformer(vendor, config, entry);
        return merge(user, {
          spec: {
            profile: {
              displayName: vendor.decodeStringAttribute(entry, 'name')[0],
              picture: vendor.decodeStringAttribute(entry, 'avatar')[0],
            }
          }
        });
      }
    }),
  );

  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
