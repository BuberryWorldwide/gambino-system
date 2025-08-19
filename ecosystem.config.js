module.exports = {
  apps: [
    {
      name: 'gambino-backend',
      script: './server.js',
      cwd: '/opt/gambino/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/opt/gambino/logs/backend-error.log',
      out_file: '/opt/gambino/logs/backend-out.log',
      log_file: '/opt/gambino/logs/backend-combined.log',
      time: true
    },
    {
      name: 'gambino-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/opt/gambino/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/opt/gambino/logs/frontend-error.log',
      out_file: '/opt/gambino/logs/frontend-out.log',
      log_file: '/opt/gambino/logs/frontend-combined.log',
      time: true
    }
  ]
};
