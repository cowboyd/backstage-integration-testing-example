export * from './support/backstage';
export * from './support/log';
export * from './support/database';

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
