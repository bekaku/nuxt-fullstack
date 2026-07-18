module.exports = [
  {
    script: 'server/index.mjs',
    cwd: '/app/',
    name: 'nuxt-web',
    exec_mode: 'cluster',
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
