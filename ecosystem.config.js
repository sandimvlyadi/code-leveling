/** @type {import('pm2').ProcessDescription[]} */
module.exports = {
  apps: [
    {
      name: "magic-portfolio",
      script: "server.js",
      cwd: "/app",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      max_memory_restart: "512M",
      error_file: "/dev/stderr",
      out_file: "/dev/stdout",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
