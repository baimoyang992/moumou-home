module.exports = ({ env }) => ({
  'users-permissions': { config: { jwtSecret: env('JWT_SECRET'), register: { allowedFields: [] } } },
  upload: { config: { sizeLimit: 20 * 1024 * 1024 } },
});
