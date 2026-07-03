module.exports = {
  apps: [
    {
      name: 'prod-olmat-backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
