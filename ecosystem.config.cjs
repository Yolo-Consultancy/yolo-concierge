/** PM2 — lancer avec : pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "yolo-frontend",
      script: ".output/server/index.mjs",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 8080,
      },
    },
  ],
};
