module.exports = [
  {
    script: 'server/index.mjs',
    cwd: '/app/',
    name: 'nuxt-web',
    exec_mode: 'cluster',
    // Keep 1 instance unless the 'login-rate-limit' storage in nuxt.config.ts uses a
    // shared driver (e.g. Redis); the default memory driver is per process.
    instances: 1,
    // out_file: '/var/log/web-output.log',
    // error_file: '/var/log/web-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }
]
