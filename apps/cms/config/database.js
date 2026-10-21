const path = require('node:path');
module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  return { connection: {
    client,
    ...(client === 'postgres' ? {
      connection: { host: env('DATABASE_HOST', 'database'), port: env.int('DATABASE_PORT', 5432), database: env('DATABASE_NAME', 'home'), user: env('DATABASE_USERNAME', 'home'), password: env('DATABASE_PASSWORD'), ssl: env.bool('DATABASE_SSL', false) }, pool: { min: 2, max: 10 },
    } : { connection: { filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')) }, useNullAsDefault: true }),
  } };
};
