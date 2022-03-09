import { Operation, spawn, Symbol } from 'effection';
import { daemon, Process } from '@effection/process';
import { Config, ConfigReader } from '@backstage/config';
import type { JsonObject, JsonValue, JsonPrimitive } from '@backstage/types';
import { SingleHostDiscovery } from '@backstage/backend-common';
import { CatalogApi, CatalogClient } from '@backstage/catalog-client';
import { ProcessLog } from './log';

export interface BackstageOptions {
  log?: boolean | ProcessLog;
  config: JsonObject;
}

export function createBackstage(options: BackstageOptions): Operation<CatalogApi> {
  const { log = false, config } = options;
  const reader = new ConfigReader(config);
  return {
    name: 'backstage server',
    labels: { baseUrl: reader.get('backend.baseUrl') },
    *init() {
      const { JEST_WORKER_ID, ...env } = process.env;
      const proc: Process = yield daemon('yarn --cwd ../.. start-backend', {
        env: {
          ...env,
          NODE_ENV: 'development',
          ...configToEnv(reader),
        } as Record<string, string>,
      });

      yield spawn(proc.stdout.lines().forEach(function*(line) {
        if (line.match(/failed to start/)) {
          throw new Error(line);
        }
      }));

      if (log) {
        yield spawn({
          name: 'stdout.log',
          expand: false,
          [Symbol.operation]: proc.stdout.forEach(function*(buffer) {
            const data = String(buffer);
            if (log === true) {
              console.log(data);
            } else {
              yield log.out(data)
            }
          })
        });
        yield spawn({
          name: 'stderr.log',
          expand: false,
          [Symbol.operation]: proc.stderr.forEach(function*(buffer) {
            const data = String(buffer);
            if (log === true) {
              console.log(data);
            } else {
              yield log.out(data)
            }
          })
        })
      }

      yield proc.stdout.lines().grep(/Listening on/).first();

      return new CatalogClient({
        discoveryApi: SingleHostDiscovery.fromConfig(reader),
      });
    },
  };
}

function configToEnv(config: Config): Record<string, string> {
  function collect(data: JsonValue, path: string[] = []): Record<string, string> {
    if (isObject(data)) {
      return Object.entries(data).reduce((env, [key, value]) => {
        return {
          ...env,
          ...collect(value ?? null, path.concat(key))
        }
      }, {});
    } else if (isPrimitive(data)) {
      return { [`APP_CONFIG_${path.join('_')}`]: String(data) };
    }

    return {};
  }
  return collect(config.get());
}

function isPrimitive(json: JsonValue): json is JsonPrimitive {
  return json == null || typeof json !== 'object';
}

function isObject(json: JsonValue): json is JsonObject {
  return json != null && !Array.isArray(json) && typeof json === 'object';
}
