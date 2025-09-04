module.exports = {
  apps: [
    {
      name: 'cochin-api-dev',
      script: 'server/server.js',
      exec_mode: 'cluster',
      instances: 4,
      watch: ['server'],
      ignore_watch: ['node_modules', 'dist', '.git'],
      autorestart: true,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'development',
      },
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'cochin-client-dev',
      script: 'npm',
      args: 'run client:dev',
      exec_mode: 'fork',
      instances: 1,
      watch: ['client'],
      ignore_watch: ['node_modules', 'dist', '.git'],
      env: {
        NODE_ENV: 'development',
      },
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
